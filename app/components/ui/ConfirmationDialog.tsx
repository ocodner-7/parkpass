"use client";

import { CircleHelp, Loader2, TriangleAlert } from "lucide-react";
import { ModalWrapper } from "./ModalWrapper";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
  error?: string;
}

const buttonBase =
  "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-control px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = true,
  error,
}: ConfirmDialogProps) {
  const Icon = isDangerous ? TriangleAlert : CircleHelp;

  return (
    <ModalWrapper
      onClose={onCancel}
      titleId="confirm-title"
      descriptionId="confirm-message"
      size="sm"
      variant="alert"
    >
      <div
        className="relative w-full overflow-hidden rounded-card border border-border-default bg-surface-secondary shadow-2xl shadow-black/50"
      >
        <div className="px-5 pb-5 pt-6 sm:px-6">
          <span
            className={`grid size-11 place-items-center rounded-full ${
              isDangerous
                ? "bg-danger-subtle text-danger"
                : "bg-accent-subtle text-accent"
            }`}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <h2
            id="confirm-title"
            className="mt-4 text-lg font-semibold tracking-tight text-content-primary"
          >
            {title}
          </h2>
          <p id="confirm-message" className="mt-1.5 text-sm text-content-secondary">
            {message}
          </p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-control bg-danger-subtle px-3.5 py-3 text-sm text-danger"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border-subtle px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className={`${buttonBase} border border-border-strong font-medium text-content-primary hover:bg-surface-hover`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${buttonBase} text-white ${
              isDangerous
                ? "bg-danger-solid hover:bg-danger-solid-hover"
                : "bg-accent-solid hover:bg-accent-solid-hover"
            }`}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}