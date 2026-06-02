"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useAnimationStore } from "@/store/useAnimationStore";

export default function CartFlyAnimation() {
  const { isFlying, startCoords, endCoords, resetFlight } = useAnimationStore();

  if (!startCoords || !endCoords) return null;

  const size = 40;

  return (
    <AnimatePresence>
      {isFlying && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-9999"
          initial={{
            x: startCoords.x - size / 2,
            y: startCoords.y - size / 2,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: endCoords.x - size / 2,
            y: endCoords.y - size / 2,
            scale: 0.35,
            opacity: 0.2,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={resetFlight}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#de922f] text-white shadow-xl">
            <ShoppingCart className="h-5 w-5" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}