interface LogoProps {
  size?: number;
}

export function Logo({ size = 26 }: LogoProps) {
  return (
    <div className="logo" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <path
          d="M16 3 L27 8 V16 C27 23 22 27.5 16 30 C10 27.5 5 23 5 16 V8 Z"
          fill="none"
          stroke="var(--teal)"
          strokeWidth="1.7"
        />
        <circle cx="16" cy="16" r="4.4" fill="none" stroke="var(--teal)" strokeWidth="1.7" />
        <circle cx="16" cy="16" r="1.5" fill="var(--teal)" />
        <path
          d="M16 3 V11.6 M16 20.4 V30 M5 11 L11.7 14 M27 11 L20.3 14"
          stroke="var(--teal)"
          strokeWidth="1.3"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
