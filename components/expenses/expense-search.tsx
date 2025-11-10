import { SearchInput } from "@/components/ui/search-input";

interface ExpenseSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ExpenseSearch({ value, onChange }: ExpenseSearchProps) {
  return <SearchInput value={value} onChange={onChange} placeholder="Search" />;
}

