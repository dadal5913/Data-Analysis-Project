import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function ErrorBanner({
  message,
  messages,
  className
}: {
  message?: string;
  messages?: string[];
  className?: string;
}) {
  const list =
    messages && messages.length > 0 ? messages : message ? [message] : [];
  if (list.length === 0) return null;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="text-foreground">
        {list.length === 1 ? (
          list[0]
        ) : (
          <ul className="list-disc space-y-1 pl-4">
            {list.map((m, idx) => (
              <li key={`${m}-${idx}`}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
