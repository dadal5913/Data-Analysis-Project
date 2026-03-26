import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full rounded border border-border bg-surface px-3 py-2 text-sm" {...props} />;
}
