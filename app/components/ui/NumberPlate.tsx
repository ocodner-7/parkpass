"use client";

interface NumberPlateProps {
  registration: string;
    className?: string;
}

export const NumberPlate = ({ registration, className }: NumberPlateProps) => {
  return (
    <span
      style={{ fontFamily: "'UK Number Plate', sans-serif" }}
      className={`inline-block px-3 py-0.5 bg-yellow-400 text-black text-sm rounded border-2 border-yellow-600 tracking-wider ${className}`}
    >
      {registration}
    </span>
  );
};
