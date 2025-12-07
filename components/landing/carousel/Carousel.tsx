"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { CardItem } from "./types";
import { Hand, RotateCw, Info } from "lucide-react";
import type { Dictionary } from "@/types/i18n";

interface CarouselProps {
  items: CardItem[];
  dictionary: Dictionary;
}

const Carousel: React.FC<CarouselProps> = ({ items, dictionary }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsClient(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // --- REACTIVE STATE ---
  const [desktopTransforms, setDesktopTransforms] = useState([
    { id: 1, x: "380px", y: "-260px", rotate: "-6deg" },
    { id: 2, x: "260px", y: "-210px", rotate: "5deg" },
    { id: 3, x: "-220px", y: "30px", rotate: "-10deg" },
    { id: 4, x: "100px", y: "50px", rotate: "-4deg" },
    { id: 5, x: "-60px", y: "-128px", rotate: "2deg" },
  ]);

  const [cardSize, setCardSize] = useState({ w: "380px", h: "520px" });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let scale = 1;

      // Reactive scaling logic
      if (width < 1024) {
        // Tablet / Small Desktop (Stacked layout)
        // Available width is roughly width - padding.
        scale = Math.min(1, (width - 100) / 800);
      } else {
        // Desktop (Side by side)
        // Available width is roughly width / 2.
        scale = Math.min(1, (width / 2 - 50) / 700);
      }
      // Clamp scale to reasonable limits
      scale = Math.max(0.5, Math.min(1.1, scale));

      const baseW = 380;
      const baseH = 520;

      setCardSize({
        w: `${baseW * scale}px`,
        h: `${baseH * scale}px`,
      });

      // Balanced coordinates centered around 0
      const baseTransforms = [
        { id: 1, x: -300, y: -240, rotate: -6 },
        { id: 2, x: 300, y: -200, rotate: 5 },
        { id: 3, x: -150, y: 30, rotate: -10 },
        { id: 4, x: 150, y: 50, rotate: -4 },
        { id: 5, x: 0, y: -120, rotate: 2 },
      ];

      setDesktopTransforms(
        baseTransforms.map((t) => ({
          ...t,
          x: `${t.x * scale}px`,
          y: `${t.y * scale}px`,
          rotate: `${t.rotate}deg`,
        }))
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- MOBILE STACK CONFIGURATION ---
  // Base offsets for the slots. We will add random jitter to these based on card ID.
  const messyOffsets = [
    { x: 0, y: 0, r: 0, z: 0 }, // 0: Active
    { x: 45, y: -15, r: 6, z: -1 }, // 1: Right peek
    { x: -45, y: -25, r: -6, z: -2 }, // 2: Left peek
    { x: 50, y: -40, r: 10, z: -3 }, // 3: Right peek
    { x: -50, y: -50, r: -8, z: -4 }, // 4: Left peek
  ];

  // --- STATE FOR MOBILE INTERACTIONS ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStart = useRef<number | null>(null);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- DESKTOP HANDLERS ---

  const handleClose = useCallback(() => {
    setActiveId(null);
    setIsFlipped(false);
  }, []);

  const handleDesktopCardClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    if (activeId === id) {
      // If already active, flip it
      setIsFlipped(!isFlipped);
    } else if (activeId !== null) {
      // If another card is active, close the active one
      handleClose();
    } else {
      // Zoom in
      setActiveId(id);
      setIsFlipped(false);
    }
  };

  // Handle ESC key and Click Outside
  useEffect(() => {
    if (!activeId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    const handleGlobalClick = () => {
      handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, [activeId, handleClose]);

  // --- MOBILE HANDLERS ---

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    isDragging.current = false;

    // Start Long Press Timer
    longPressTimer.current = setTimeout(() => {
      // Only flip if we haven't dragged much
      if (!isDragging.current) {
        setIsFlipped((prev) => !prev);
      }
    }, 500); // 500ms for long press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;

    const currentTouch = e.touches[0].clientX;
    const diff = currentTouch - touchStart.current;

    // If moved more than 10px, it's a drag, cancel long press
    if (Math.abs(diff) > 10) {
      isDragging.current = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    if (isDragging.current) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer if it hasn't fired yet
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart.current || !isDragging.current) {
      setDragOffset(0);
      return;
    }

    const endTouch = e.changedTouches[0].clientX;
    const diff = touchStart.current - endTouch; // Positive if dragged left

    // Swipe Threshold
    if (Math.abs(diff) > 75) {
      if (diff > 0) {
        // Swipe Left -> Next
        nextCard();
      } else {
        // Swipe Right -> Prev
        prevCard();
      }
    }

    setDragOffset(0);
    touchStart.current = null;
    isDragging.current = false;
  };

  const nextCard = () => {
    setIsFlipped(false); // Reset flip on change
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevCard = () => {
    setIsFlipped(false); // Reset flip on change
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleMobileCardClick = (e: React.MouseEvent, offsetIndex: number) => {
    e.stopPropagation(); // Stop bubbling to prevent unwanted side effects

    // If user clicked a background card (offsetIndex > 0), bring it to front
    if (offsetIndex !== 0) {
      // Calculate the actual index of the clicked card
      const clickedCardIndex = (currentIndex + offsetIndex) % items.length;
      setIsFlipped(false);
      setCurrentIndex(clickedCardIndex);
    }
  };

  // Prevent context menu on long press for mobile
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // --- RENDER HELPERS ---

  const getDesktopStyle = (item: CardItem) => {
    const isActive = activeId === item.id;
    const transformConfig = desktopTransforms.find((t) => t.id === item.id) || {
      x: "0",
      y: "0",
      rotate: "0",
    };

    if (isActive) {
      return {
        zIndex: 50,
        transform: "translate(-50%, -50%) scale(1)", // Center of container
        top: "55%",
        left: "50%",
      };
    }

    return {
      zIndex: 10,
      // Position based on center + offset
      top: "55%",
      left: "50%",
      transform: `translate(calc(-50% + ${transformConfig.x}), calc(-50% + ${transformConfig.y})) rotate(${transformConfig.rotate}) scale(0.65)`,
      cursor: "pointer",
    };
  };

  const renderCardBack = (item: CardItem) => (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-slate-700 bg-slate-800 p-8 text-center text-white shadow-2xl dark:bg-slate-900">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
        <Info className="h-8 w-8 text-blue-400" />
      </div>
      <h3 className="mb-2 text-2xl font-bold">{item.title}</h3>
      <p className="mb-8 text-sm leading-relaxed text-slate-300">
        {dictionary.home.mock_dashboard.carousel_back.desc.replace(
          "{title}",
          item.title
        )}
      </p>

      <div className="mt-auto w-full space-y-3 text-left">
        <div className="flex items-center gap-3 rounded-xl bg-slate-700/30 p-3">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <span className="text-sm text-slate-200">
            {dictionary.home.mock_dashboard.carousel_back.feature_1}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-700/30 p-3">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <span className="text-sm text-slate-200">
            {dictionary.home.mock_dashboard.carousel_back.feature_2}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-700/30 p-3">
          <div className="h-2 w-2 rounded-full bg-blue-400"></div>
          <span className="text-sm text-slate-200">
            {dictionary.home.mock_dashboard.carousel_back.feature_3}
          </span>
        </div>
      </div>
    </div>
  );

  // Debounce helper
  const debounce = <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  useEffect(() => {
    const handleResize = debounce(() => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Sync with Tailwind md breakpoint
      let scale = 1;

      // Reactive scaling logic
      if (width < 1024) {
        // Tablet / Small Desktop (Stacked layout)
        // Available width is roughly width - padding.
        scale = Math.min(1.1, (width - 50) / 600);
      } else {
        // Desktop (Side by side)
        // Available width is roughly width / 2.
        scale = Math.min(1.2, (width / 2 - 20) / 600);
      }
      // Clamp scale to reasonable limits
      scale = Math.max(0.6, Math.min(1.2, scale));

      const baseW = 400;
      const baseH = 540;

      setCardSize({
        w: `${baseW * scale}px`,
        h: `${baseH * scale}px`,
      });

      // Balanced coordinates centered around 0
      const baseTransforms = [
        { id: 1, x: -300, y: -240, rotate: -6 },
        { id: 2, x: 300, y: -200, rotate: 5 },
        { id: 3, x: -150, y: 30, rotate: -10 },
        { id: 4, x: 150, y: 50, rotate: -4 },
        { id: 5, x: 0, y: -120, rotate: 2 },
      ];

      setDesktopTransforms(
        baseTransforms.map((t) => ({
          ...t,
          x: `${t.x * scale}px`,
          y: `${t.y * scale}px`,
          rotate: `${t.rotate}deg`,
        }))
      );
    }, 100); // 100ms debounce

    handleResize(); // Initial call

    const debouncedResize = handleResize;
    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, []);
  return (
    <div className="h-full w-full">
      {/* ================= DESKTOP VIEW ================= */}
      {isClient && !isMobile && (
        <div className="relative h-full w-full perspective-[2000px]">
          {/* Click outside listener when active */}
          {activeId && (
            <div
              className="absolute inset-0 z-40 bg-transparent"
              onClick={handleClose}
            ></div>
          )}

          {items.map((item) => {
            const isActive = activeId === item.id;
            const style = getDesktopStyle(item);

            return (
              <div
                key={item.id}
                className="preserve-3d absolute transition-transform duration-700 ease-out select-none"
                style={{
                  ...style,
                  width: cardSize.w,
                  height: cardSize.h,
                }}
                onClick={(e) => handleDesktopCardClick(e, item.id)}
              >
                {/* Flipper Container */}
                <div
                  className={`preserve-3d relative h-full w-full duration-700 will-change-transform ${isActive && isFlipped ? "rotate-y-180" : ""}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front Face - Added bg-white to wrapper to prevent z-fighting/visibility issues */}
                  <div
                    className={`absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 backface-hidden dark:bg-slate-900 ${isActive ? "" : "hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)]"}`}
                    style={{
                      transform: "translateZ(1px)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {/* Block interaction on front face if not active to allow zoom click */}
                    <div
                      className={`h-full w-full ${isActive ? "" : "pointer-events-none"}`}
                    >
                      {item.component}
                    </div>
                  </div>

                  {/* Back Face */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-3xl bg-slate-800 shadow-2xl backface-hidden dark:bg-slate-900"
                    style={{
                      transform: "rotateY(180deg) translateZ(1px)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                    }}
                  >
                    {renderCardBack(item)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MOBILE VIEW (MESSY 3D STACK) ================= */}
      {isClient && isMobile && (
        <div
          className="relative flex h-full w-full touch-pan-y items-center justify-center overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative h-[420px] w-[300px]">
            {items.map((item, index) => {
              // Calculate visual position in the stack (0 to length-1)
              const offsetIndex =
                (index - currentIndex + items.length) % items.length;

              // Only render the first few cards for performance and visual clarity
              if (offsetIndex > 4) return null;

              const config = messyOffsets[offsetIndex];

              // Dynamic floating animation per card
              const floatAnimationClass =
                offsetIndex === 0
                  ? "animate-float-slow"
                  : offsetIndex === 1
                    ? "animate-float-medium"
                    : "animate-float-fast";

              // --- DETERMINISTIC RANDOMNESS ---
              // We use item.id to generate consistent random values for rotation and x-offset
              // This ensures the card looks "messy" but the messiness travels with the card.
              // randomness is ignored for the active card (offsetIndex === 0)
              const randomRotate =
                offsetIndex === 0 ? 0 : ((item.id * 17) % 15) - 7; // -7 to +7 deg
              const randomX =
                offsetIndex === 0 ? 0 : ((item.id * 23) % 30) - 15; // -15 to +15 px

              // Apply drag offset
              const dragX = offsetIndex === 0 ? dragOffset : dragOffset * 0.1; // Move top card fully, others slightly
              const dragRotate = offsetIndex === 0 ? dragOffset * 0.05 : 0; // Rotate top card slightly

              // Disable animation while dragging to prevent transform conflicts
              const activeAnimationClass =
                dragOffset !== 0 ? "" : floatAnimationClass;

              return (
                <div
                  key={item.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: 50 - offsetIndex * 10,
                    transform: `
                                translate3d(${config.x + randomX + dragX}px, ${config.y}px, ${config.z * 40}px) 
                                rotateZ(${config.r + randomRotate + dragRotate}deg) 
                                rotateY(${offsetIndex * -5}deg)
                                scale(${1 - offsetIndex * 0.05})
                            `,
                    opacity: 1 - offsetIndex * 0.15,
                    filter: offsetIndex === 0 ? "none" : "blur(2px)",
                    transformOrigin: "center bottom",
                    perspective: "1000px",
                    // Disable transition during drag for instant response, otherwise use spring-like transition
                    transition:
                      dragOffset !== 0
                        ? "none"
                        : "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                  }}
                  onClick={(e) => handleMobileCardClick(e, offsetIndex)}
                  onContextMenu={handleContextMenu}
                >
                  {/* Float Animation Wrapper */}
                  <div
                    className={`preserve-3d h-full w-full ${activeAnimationClass}`}
                  >
                    {/* Flipper Container */}
                    <div
                      className={`preserve-3d relative h-full w-full duration-700 ${offsetIndex === 0 && isFlipped ? "rotate-y-180" : ""}`}
                    >
                      {/* Front Face */}
                      <div
                        className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] backface-hidden dark:bg-slate-900"
                        style={{
                          transform: "translateZ(1px)",
                          // Fix for mobile blur: ensure high-quality rendering
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                      >
                        {item.component}
                      </div>

                      {/* Back Face */}
                      <div
                        className="absolute inset-0 overflow-hidden rounded-3xl bg-slate-800 shadow-2xl backface-hidden dark:bg-slate-900"
                        style={{ transform: "rotateY(180deg) translateZ(1px)" }}
                      >
                        {renderCardBack(item)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Instructions */}
          <div className="pointer-events-none absolute right-0 bottom-8 left-0 z-50 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-slate-400">
              {isFlipped ? (
                <>
                  <Hand className="h-3 w-3 animate-pulse" />
                  <span>
                    {dictionary.home.mock_dashboard.carousel_instructions.swipe}
                  </span>
                </>
              ) : (
                <>
                  <RotateCw className="h-3 w-3" />
                  <span>
                    {dictionary.home.mock_dashboard.carousel_instructions.hold}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
