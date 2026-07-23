"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-1.5 text-sm text-content-muted hover:text-content-primary transition-colors cursor-pointer mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </button>
  );
}
