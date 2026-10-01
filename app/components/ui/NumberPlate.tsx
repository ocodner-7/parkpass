interface NumberPlateProps {
  registration: string;
  className?: string;
  size?: "sm" | "default";
}

const sizes = {
  sm: {
    band: "w-3 text-[6px] pb-[2px]",
    text: "px-1.5 text-xs leading-[1.65]",
  },
  default: {
    band: "w-4 text-[7px] pb-[3px]",
    text: "px-2.5 text-sm leading-[1.7]",
  },
};

export function NumberPlate({
  registration,
  className = "",
  size = "default",
}: NumberPlateProps) {
  const s = sizes[size];

  return (
    <span
      className={`inline-flex shrink-0 items-stretch overflow-hidden rounded-[4px] border border-black/80 bg-plate-yellow align-middle shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_1px_2px_rgb(0_0_0/0.45)] ${className}`}
    >
      <span
        aria-hidden
        className={`flex flex-col items-center justify-end bg-sign-blue font-sans font-bold leading-none text-white ${s.band}`}
      >
        UK
      </span>
      <span
        className={`whitespace-nowrap font-plate uppercase tracking-wider text-neutral-950 ${s.text}`}
      >
        {registration}
      </span>
    </span>
  );
}