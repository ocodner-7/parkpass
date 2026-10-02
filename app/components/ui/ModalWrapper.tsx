"use client";

import { Dialog } from "@base-ui/react/dialog";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { motion, useReducedMotion } from "motion/react";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  /** id of the modal's heading, so screen readers announce it on open */
  titleId: string;
  /** id of supporting text, read out after the title */
  descriptionId?: string;
  size?: "sm" | "md" | "lg";
  /**
   * dialog: centred on sm+, bottom-anchored card on phones
   * alert:  same layout, but a backdrop click won't dismiss it (confirmations)
   * sheet:  full-width bottom sheet (location drawer)
   */
  variant?: "dialog" | "alert" | "sheet";
}

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

/**
 * Base UI handles the accessibility: focus moves into the modal on open,
 * Tab is trapped inside it, the page behind is hidden from screen readers,
 * Escape and outside clicks close it, and focus returns to whatever opened
 * it on close. Motion only handles the visuals.
 *
 * Parents still mount it conditionally inside <AnimatePresence>, so exit
 * animations keep working: AnimatePresence holds this mounted until the
 * motion children below finish animating out.
 */
export function ModalWrapper({
  children,
  onClose,
  titleId,
  descriptionId,
  size = "md",
  variant = "dialog",
}: ModalWrapperProps) {
  const reduceMotion = useReducedMotion();
  const isSheet = variant === "sheet";
  const Root = variant === "alert" ? AlertDialog.Root : Dialog.Root;

  const panelMotion = isSheet
    ? {
        initial: { y: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: reduceMotion ? 0 : "100%", opacity: reduceMotion ? 0 : 1 },
      }
    : {
        initial: { opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 16 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 16 },
      };

  return (
    <Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
        </Dialog.Backdrop>

        <Dialog.Viewport
          className={
            isSheet
              ? "fixed inset-0 z-50 flex items-end"
              : "fixed inset-0 z-50 flex items-end justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:items-center sm:pb-0"
          }
        >
          <Dialog.Popup
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className={`w-full outline-none ${isSheet ? "" : sizeClass[size]}`}
          >
            <motion.div
              className="w-full"
              {...panelMotion}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : isSheet
                    ? { type: "spring", damping: 32, stiffness: 380 }
                    : { type: "spring", damping: 30, stiffness: 400 }
              }
            >
              {children}
            </motion.div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Root>
  );
}