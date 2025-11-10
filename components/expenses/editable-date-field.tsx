"use client";

import { Input } from "@/components/ui/input";

interface EditableDateFieldProps {
  value: string;
  isEditing: boolean;
  onSave: (date: string) => void;
  onCancel: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export function EditableDateField({
  value,
  isEditing,
  onSave,
  onCancel,
  onClick,
}: EditableDateFieldProps) {
  if (isEditing) {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onSave(e.target.value)}
        onBlur={onCancel}
        className="h-8 text-sm w-40"
        autoFocus
      />
    );
  }

  return (
    <span onClick={onClick}>
      {new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}
    </span>
  );
}

