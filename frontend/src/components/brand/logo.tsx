import { cn } from "@/lib/utils";

export function Logo({
  size = 28,
  withWordmark = true,
  className
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="relative flex items-center justify-center rounded-lg"
        style={{
          width: size,
          height: size,
          background:
            "linear-gradient(135deg, #5B8CFF 0%, #22C55E 100%)",
          boxShadow:
            "0 6px 20px -6px rgba(91, 140, 255, 0.55), inset 0 1px 0 rgba(255,255,255,0.2)"
        }}
      >
        <svg
          width={Math.round(size * 0.62)}
          height={Math.round(size * 0.62)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 17l5-7 4 4 7-9" />
        </svg>
      </div>
      {withWordmark ? (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            QuantLab
          </span>
          <span className="text-2xs font-medium uppercase tracking-[0.14em] text-foreground-subtle">
            Research
          </span>
        </div>
      ) : null}
    </div>
  );
}
