"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Crop, RotateCcw } from "lucide-react";

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  onCrop: (croppedFile: File) => void;
  saveLabel?: string;
  zoomLabel?: string;
  resetLabel?: string;
  title?: string;
  description?: string;
  cropPreviewAlt?: string;
}

export function ImageCropper({
  open,
  onOpenChange,
  file,
  onCrop,
  saveLabel = "Crop & Save",
  zoomLabel = "Zoom",
  resetLabel = "Reset",
  title = "Edit Photo",
  description = "Drag to reposition and use the slider to zoom.",
  cropPreviewAlt = "Crop preview",
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setTimeout(() => {
        setImageSrc(url);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      }, 0);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!imageRef.current) return;

    setIsCropping(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set output size (e.g., 400x400)
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      // Calculate ratio between canvas and container (300px)
      const ratio = size / 300;

      const image = imageRef.current;

      // Draw background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Save context
      ctx.save();

      // Clip to circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Move to center and apply offset (scaled)
      ctx.translate(size / 2 + offset.x * ratio, size / 2 + offset.y * ratio);

      // Apply zoom
      ctx.scale(zoom, zoom);

      // Draw image centered
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file?.name || "cropped.jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            onCrop(croppedFile);
            onOpenChange(false);
          }
          setIsCropping(false);
        },
        "image/jpeg",
        0.9
      );
    } catch (error) {
      console.error("Crop failed", error);
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <div
            ref={containerRef}
            className="border-primary/20 relative h-[300px] w-[300px] cursor-move overflow-hidden rounded-full border-4 bg-black/5"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={imageSrc}
                alt={cropPreviewAlt}
                className="pointer-events-none absolute max-w-none origin-center select-none"
                style={{
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  left: "50%",
                  top: "50%",
                }}
                draggable={false}
                crossOrigin="anonymous"
              />
            )}
          </div>

          <div className="w-full space-y-2 px-4">
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{zoomLabel}</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="bg-secondary accent-primary h-2 w-full cursor-pointer appearance-none rounded-lg"
              aria-label={zoomLabel}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setZoom(1);
              setOffset({ x: 0, y: 0 });
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {resetLabel}
          </Button>
          <Button onClick={handleCrop} disabled={isCropping}>
            {isCropping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Crop className="mr-2 h-4 w-4" />
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
