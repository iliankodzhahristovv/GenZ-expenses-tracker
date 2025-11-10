"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface EditableAmountFieldProps {
  value: number;
  currencySymbol: string;
  isEditing: boolean;
  onSave: (amount: number) => void;
  onCancel: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export function EditableAmountField({
  value,
  currencySymbol,
  isEditing,
  onSave,
  onCancel,
  onClick,
}: EditableAmountFieldProps) {
  const [editValue, setEditValue] = useState(value.toFixed(2));

  // Update editValue when value changes or when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditValue(value.toFixed(2));
    }
  }, [isEditing, value]);

  const handleSave = () => {
    const amount = parseFloat(editValue);
    if (!isNaN(amount) && amount > 0) {
      onSave(amount);
    } else {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Only allow numbers and one decimal point
    input = input.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = input.split('.');
    if (parts.length > 2) {
      input = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      input = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    setEditValue(input);
  };

  if (isEditing) {
    return (
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          {currencySymbol}
        </span>
        <Input
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={handleChange}
          onFocus={(e) => e.target.select()}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          className="h-8 text-sm pl-6 w-32"
          autoFocus
        />
      </div>
    );
  }

  return (
    <span onClick={onClick}>
      {currencySymbol}
      {value.toFixed(2)}
    </span>
  );
}

