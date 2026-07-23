"use client";
import { X } from "lucide-react";
import { ModalWrapper } from "./ModalWrapper";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true,
}: ConfirmDialogProps) {
  return (
    <ModalWrapper onClose={onCancel}>
      <div className="relative bg-surface-secondary rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <h2 className="text-base font-semibold text-content-primary">{title}</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-content-muted" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-content-muted">{message}</p>
        </div>

        <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 bg-surface-secondary">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-content-muted hover:text-content-primary transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-medium rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
              isDangerous
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
