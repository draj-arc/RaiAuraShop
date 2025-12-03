import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-2xl md:text-3xl" },
    lg: { icon: 48, text: "text-4xl md:text-5xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Elegant Diamond/Jewel Logo */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        {/* Outer diamond shape */}
        <path
          d="M24 4L44 24L24 44L4 24L24 4Z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner diamond */}
        <path
          d="M24 12L36 24L24 36L12 24L24 12Z"
          fill="currentColor"
          opacity="0.2"
        />
        {/* Center gem facets */}
        <path
          d="M24 12L30 18L24 24L18 18L24 12Z"
          fill="currentColor"
          opacity="0.6"
        />
        <path
          d="M24 24L30 18L36 24L30 30L24 24Z"
          fill="currentColor"
          opacity="0.4"
        />
        <path
          d="M24 24L30 30L24 36L18 30L24 24Z"
          fill="currentColor"
          opacity="0.5"
        />
        <path
          d="M24 24L18 30L12 24L18 18L24 24Z"
          fill="currentColor"
          opacity="0.3"
        />
        {/* Sparkle accents */}
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <path
          d="M24 8L25 10L24 12L23 10L24 8Z"
          fill="currentColor"
        />
        <path
          d="M40 24L38 25L36 24L38 23L40 24Z"
          fill="currentColor"
        />
        <path
          d="M24 36L25 38L24 40L23 38L24 36Z"
          fill="currentColor"
        />
        <path
          d="M12 24L10 25L8 24L10 23L12 24Z"
          fill="currentColor"
        />
      </svg>
      
      {showText && (
        <span className={cn("font-serif font-light text-primary", text)}>
          Rai Aura
        </span>
      )}
    </div>
  );
}

// Favicon version (simple, works well at small sizes)
export function LogoIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      <path
        d="M24 4L44 24L24 44L4 24L24 4Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M24 12L36 24L24 36L12 24L24 12Z"
        fill="currentColor"
        opacity="0.3"
      />
      <path
        d="M24 12L30 18L24 24L18 18L24 12Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M24 24L30 18L36 24L30 30L24 24Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M24 24L30 30L24 36L18 30L24 24Z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M24 24L18 30L12 24L18 18L24 24Z"
        fill="currentColor"
        opacity="0.4"
      />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
    </svg>
  );
}
