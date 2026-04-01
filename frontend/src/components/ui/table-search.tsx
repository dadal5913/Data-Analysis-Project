import { Input } from "@/components/ui/input";

export function TableSearch({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      value={value}
    />
  );
}
