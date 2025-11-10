"use client";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditableCategoryFieldProps {
  value: string;
  icon: string;
  color: string;
  categories: Record<string, Array<{ id: string; icon: string; name: string }>>;
  isEditing: boolean;
  onSave: (category: string) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function EditableCategoryField({
  value,
  icon,
  color,
  categories,
  isEditing,
  onSave,
  onClick,
}: EditableCategoryFieldProps) {
  if (isEditing) {
    return (
      <Select 
        value={value} 
        onValueChange={(newValue) => onSave(newValue)}
      >
        <SelectTrigger className="h-8 text-sm w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(categories).sort((a, b) => a.localeCompare(b)).map((groupName) => (
            <SelectGroup key={groupName}>
              <SelectLabel>{groupName}</SelectLabel>
              {categories[groupName]
                ?.sort((a, b) => a.name.localeCompare(b.name))
                .map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge className={color} onClick={onClick}>
      {icon} {value}
    </Badge>
  );
}

