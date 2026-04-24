import { Search } from "lucide-react";

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
      leftIcon={<Search className="h-3.5 w-3.5" />}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      value={value}
    />
  );
}
