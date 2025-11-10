"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EditableDateField } from "./editable-date-field";
import { EditableAmountField } from "./editable-amount-field";
import { EditableCategoryField } from "./editable-category-field";
import { EditableDescriptionField } from "./editable-description-field";
import type { Expense } from "@/hooks/expenses";
import { convertToBaseCurrency } from "@/lib/currency-utils";

interface ExpenseTableRowProps {
  expense: Expense;
  displayAmount: number;
  currencySymbol: string;
  userCurrency: string;
  categoryIcon: string;
  categoryColor: string;
  categories: Record<string, Array<{ id: string; icon: string; name: string }>>;
  onUpdate: (expense: Expense) => void;
  onDelete: (expense: Expense, e: React.MouseEvent) => void;
}

type EditingField = 'date' | 'amount' | 'category' | 'description' | null;

export function ExpenseTableRow({
  expense,
  displayAmount,
  currencySymbol,
  userCurrency,
  categoryIcon,
  categoryColor,
  categories,
  onUpdate,
  onDelete,
}: ExpenseTableRowProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);

  const handleSaveField = (field: string, value: any) => {
    let updatedExpense = { ...expense, [field]: value };
    
    // If editing amount, convert from display currency back to base currency (USD)
    if (field === 'amount') {
      const baseAmount = convertToBaseCurrency(value, userCurrency);
      updatedExpense = { ...expense, amount: baseAmount };
    }
    
    onUpdate(updatedExpense);
    setEditingField(null);
  };

  return (
    <TableRow className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
      <TableCell className="font-medium text-gray-900 py-4 cursor-pointer">
        <EditableDateField
          value={expense.date}
          isEditing={editingField === 'date'}
          onSave={(date) => handleSaveField('date', date)}
          onCancel={() => setEditingField(null)}
          onClick={(e) => {
            e.stopPropagation();
            setEditingField('date');
          }}
        />
      </TableCell>

      <TableCell className="font-semibold text-gray-900 py-4 cursor-pointer">
        <EditableAmountField
          value={displayAmount}
          currencySymbol={currencySymbol}
          isEditing={editingField === 'amount'}
          onSave={(amount) => handleSaveField('amount', amount)}
          onCancel={() => setEditingField(null)}
          onClick={(e) => {
            e.stopPropagation();
            setEditingField('amount');
          }}
        />
      </TableCell>

      <TableCell className="py-4 cursor-pointer">
        <EditableCategoryField
          value={expense.category}
          icon={categoryIcon}
          color={categoryColor}
          categories={categories}
          isEditing={editingField === 'category'}
          onSave={(category) => handleSaveField('category', category)}
          onClick={(e) => {
            e.stopPropagation();
            setEditingField('category');
          }}
        />
      </TableCell>

      <TableCell className="max-w-md truncate text-gray-700 py-4 cursor-pointer">
        <EditableDescriptionField
          value={expense.description}
          isEditing={editingField === 'description'}
          onSave={(description) => handleSaveField('description', description)}
          onCancel={() => setEditingField(null)}
          onClick={(e) => {
            e.stopPropagation();
            setEditingField('description');
          }}
        />
      </TableCell>

      <TableCell className="py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          onClick={(e) => onDelete(expense, e)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

