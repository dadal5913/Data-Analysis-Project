import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="rounded bg-accent px-4 py-2 text-white hover:opacity-90" {...props} />;
}
