// "use client";
// import { ArrowLeft } from "lucide-react";
// import { useRouter } from "next/navigation";

// export function BackButton() {
//   const router = useRouter();

//   return (
//     <button
//       onClick={() => router.back()}
//       className="flex items-center gap-1.5 text-sm text-content-muted hover:text-content-primary transition-colors cursor-pointer mb-4"
//     >
//       <ArrowLeft className="w-4 h-4" />
//       Back
//     </button>
//   );
// }
"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="-ml-2 mb-4 inline-flex h-10 items-center gap-1.5 rounded-control px-2 text-sm font-medium text-content-secondary transition-colors hover:bg-surface-hover hover:text-content-primary"
    >
      <ArrowLeft className="size-4" aria-hidden />
      Back
    </button>
  );
}