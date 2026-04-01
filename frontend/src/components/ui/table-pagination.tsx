interface Props {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <p className="text-gray-400">
        Page {page} of {totalPages} ({total} rows)
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <select
            className="rounded border border-border bg-[#0b1020] px-2 py-1"
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            value={pageSize}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        ) : null}
        <button className="rounded border border-border px-2 py-1 disabled:opacity-50" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </button>
        <button className="rounded border border-border px-2 py-1 disabled:opacity-50" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
