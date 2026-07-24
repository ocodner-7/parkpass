"use client";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function ModalWrapper({ children, onClose }: ModalWrapperProps) {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.95, y: shouldReduceMotion ? 0 : 8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
          className="relative z-10 w-full flex items-center justify-center"
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}