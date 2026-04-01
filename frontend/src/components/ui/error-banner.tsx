export function ErrorBanner({ message, messages }: { message?: string; messages?: string[] }) {
  const list = messages && messages.length > 0 ? messages : message ? [message] : [];
  if (list.length === 0) return null;
  return (
    <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
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
  );
}
