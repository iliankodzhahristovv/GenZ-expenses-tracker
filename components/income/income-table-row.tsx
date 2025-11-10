"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { EditableDateField } from "../expenses/editable-date-field";
import { EditableAmountField } from "../expenses/editable-amount-field";
import { EditableCategoryField } from "../expenses/editable-category-field";
import { EditableDescriptionField } from "../expenses/editable-description-field";
import { convertToBaseCurrency } from "@/lib/currency-utils";

interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

interface IncomeTableRowProps {
  income: Income;
  displayAmount: number;
  currencySymbol: string;
  userCurrency: string;
  categoryIcon: string;
  categoryColor: string;
  categories: Record<string, Array<{ id: string; icon: string; name: string }>>;
  onUpdate: (income: Income) => void;
  onDelete: (income: Income, e: React.MouseEvent) => void;
}

type EditingField = 'date' | 'amount' | 'category' | 'description' | null;

export function IncomeTableRow({
  income,
  displayAmount,
  currencySymbol,
  userCurrency,
  categoryIcon,
  categoryColor,
  categories,
  onUpdate,
  onDelete,
}: IncomeTableRowProps) {
  const [editingField, setEditingField] = useState<EditingField>(null);

  const handleSaveField = (field: string, value: any) => {
    let updatedIncome = { ...income, [field]: value };
    
    // If editing amount, convert from display currency back to base currency (USD)
    if (field === 'amount') {
      const baseAmount = convertToBaseCurrency(value, userCurrency);
      updatedIncome = { ...income, amount: baseAmount };
    }
    
    onUpdate(updatedIncome);
    setEditingField(null);
  };

  return (
    <TableRow className="hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors">
      <TableCell className="font-medium text-gray-900 py-4 cursor-pointer">
        <EditableDateField
          value={income.date}
          isEditing={editingField === 'date'}
          onSave={(date) => handleSaveField('date', date)}
          onCancel={() => setEditingField(null)}
          onClick={(e) => {
            e.stopPropagation();
            setEditingField('date');
          }}
        />
      </TableCell>

      <TableCell className="font-semibold text-green-600 py-4 cursor-pointer">
        {editingField === 'amount' ? (
          <EditableAmountField
            value={displayAmount}
            currencySymbol={currencySymbol}
            isEditing={true}
            onSave={(amount) => handleSaveField('amount', amount)}
            onCancel={() => setEditingField(null)}
            onClick={(e) => {}}
          />
        ) : (
          <span onClick={(e) => {
            e.stopPropagation();
            setEditingField('amount');
          }}>
            +{currencySymbol}{displayAmount.toFixed(2)}
          </span>
        )}
      </TableCell>

      <TableCell className="py-4 cursor-pointer">
        <EditableCategoryField
          value={income.category}
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
          value={income.description}
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
          onClick={(e) => onDelete(income, e)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

