"use client";

interface NumberPlateProps {
  registration: string
  className?: string
  size?: 'sm' | 'default'
}

export function NumberPlate({ registration, className = '', size = 'default' }: NumberPlateProps) {
  return (
    <span
      style={{ fontFamily: "'UK Number Plate', sans-serif" }}
      className={`inline-block bg-yellow-400 text-black rounded border-2 border-yellow-600 tracking-wider ${
        size === 'sm' ? 'px-1.5 py-0 text-xs' : 'px-3 py-0.5 text-sm'
      } ${className}`}
    >
      {registration}
    </span>
  )
}
