"use client";

import { m } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export function AnimatedIcon() {
  return (
    <m.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.5,
      }}
      className="relative"
    >
      <m.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full bg-red-200 blur-xl dark:bg-red-900"
      />
      <m.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
        transition={{ rotate: { duration: 0.5 } }}
        className="relative rounded-full border border-slate-100 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <ShieldAlert className="h-20 w-20 text-red-600 dark:text-red-400" />
      </m.div>
    </m.div>
  );
}
