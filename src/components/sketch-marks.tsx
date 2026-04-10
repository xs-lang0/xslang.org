// hand-drawn SVG accents. paths are intentionally a little wonky.

export function CircleMark({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 60"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16 Q 12 30, 22 44 Q 60 56, 96 46 Q 112 32, 102 18 Q 76 4, 38 8 Q 24 11, 22 16 Z" />
    </svg>
  );
}

export function UnderlineMark({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 7 Q 36 2, 72 5 T 144 7 T 197 4" />
    </svg>
  );
}

export function ArrowMark({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 12 Q 30 22, 38 40 Q 44 58, 60 64" />
      <path d="M52 56 L 62 65 L 51 70" />
    </svg>
  );
}

export function StarMark({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20 4 L 22 18 L 36 20 L 22 22 L 20 36 L 18 22 L 4 20 L 18 18 Z" />
    </svg>
  );
}

export function BracketMark({
  className = "",
  color = "currentColor",
  side = "left",
}: {
  className?: string;
  color?: string;
  side?: "left" | "right";
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 100"
      preserveAspectRatio="none"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {side === "left" ? (
        <path d="M16 4 Q 8 8, 6 22 Q 4 50, 6 78 Q 8 92, 16 96" />
      ) : (
        <path d="M8 4 Q 16 8, 18 22 Q 20 50, 18 78 Q 16 92, 8 96" />
      )}
    </svg>
  );
}

export function ZigzagDivider({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 14"
      preserveAspectRatio="none"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M0 7 L 30 4 L 60 9 L 95 5 L 130 8 L 170 4 L 210 9 L 250 5 L 290 8 L 330 4 L 370 9 L 410 5 L 450 8 L 490 4 L 530 9 L 570 5 L 610 8 L 650 4 L 690 9 L 730 5 L 770 8 L 810 4 L 850 9 L 890 5 L 930 8 L 970 4 L 1010 9 L 1050 5 L 1090 8 L 1130 4 L 1170 9 L 1200 6" />
    </svg>
  );
}
