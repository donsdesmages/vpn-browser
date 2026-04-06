interface KeyIconProps {
  size?: number;
  className?: string;
}

export default function KeyIcon({ size = 120, className = "" }: KeyIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Outer glow */}
        <radialGradient id="glow-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
        </radialGradient>

        {/* Key body gradient */}
        <linearGradient id="key-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Highlight for 3D effect */}
        <linearGradient id="highlight" x1="0%" y1="0%" x2="60%" y2="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* Inner shadow for ring */}
        <radialGradient id="ring-inner" cx="42%" cy="38%" r="40%">
          <stop offset="0%" stopColor="#0a1628" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0a1628" stopOpacity="0" />
        </radialGradient>

        <filter id="glow-filter">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background glow circle */}
      <circle cx="60" cy="55" r="52" fill="url(#glow-bg)" />

      {/* Key ring (outer) */}
      <circle
        cx="52"
        cy="42"
        r="26"
        stroke="url(#key-grad)"
        strokeWidth="13"
        fill="none"
      />

      {/* Key ring inner shadow (for depth) */}
      <circle
        cx="52"
        cy="42"
        r="16"
        fill="url(#ring-inner)"
      />

      {/* Ring highlight */}
      <circle
        cx="52"
        cy="42"
        r="26"
        stroke="url(#highlight)"
        strokeWidth="6"
        fill="none"
        strokeDasharray="60 200"
        strokeDashoffset="-10"
        strokeLinecap="round"
      />

      {/* Key shaft */}
      <rect
        x="52.5"
        y="55"
        width="13"
        height="45"
        rx="6.5"
        fill="url(#key-grad)"
      />

      {/* Shaft highlight */}
      <rect
        x="52.5"
        y="55"
        width="7"
        height="45"
        rx="3.5"
        fill="url(#highlight)"
      />

      {/* Key tooth 1 */}
      <rect
        x="65.5"
        y="70"
        width="11"
        height="9"
        rx="4.5"
        fill="url(#key-grad)"
      />

      {/* Key tooth 2 */}
      <rect
        x="65.5"
        y="84"
        width="9"
        height="9"
        rx="4.5"
        fill="url(#key-grad)"
      />

      {/* Tooth highlights */}
      <rect x="65.5" y="70" width="6" height="9" rx="3" fill="url(#highlight)" />
      <rect x="65.5" y="84" width="5" height="9" rx="3" fill="url(#highlight)" />
    </svg>
  );
}
