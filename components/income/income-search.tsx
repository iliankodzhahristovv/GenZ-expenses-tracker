import { SearchInput } from "@/components/ui/search-input";

interface IncomeSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function IncomeSearch({ value, onChange }: IncomeSearchProps) {
  return <SearchInput value={value} onChange={onChange} placeholder="Search" />;
}

