"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableDescriptionFieldProps {
  value: string;
  isEditing: boolean;
  onSave: (description: string) => void;
  onCancel: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export function EditableDescriptionField({
  value,
  isEditing,
  onSave,
  onCancel,
  onClick,
}: EditableDescriptionFieldProps) {
  const [editValue, setEditValue] = useState(value);

  // Sync local state with prop changes when entering edit mode or when value changes
  useEffect(() => {
    if (isEditing) {
      setEditValue(value);
    }
  }, [isEditing, value]);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
    } else {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave();
          }
        }}
        className="h-8 text-sm"
        autoFocus
      />
    );
  }

  return <span onClick={onClick}>{value}</span>;
}

