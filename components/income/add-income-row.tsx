"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface AddIncomeRowProps {
  currencySymbol: string;
  categories: Record<string, Array<{ id: string; icon: string; name: string }>>;
  onSave: (income: { date: string; amount: string; description: string; category: string }) => void;
  onCancel: () => void;
}

export function AddIncomeRow({
  currencySymbol,
  categories,
  onSave,
  onCancel,
}: AddIncomeRowProps) {
  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });

  const handleSave = () => {
    if (!newIncome.description.trim()) {
      return;
    }
    if (!newIncome.category) {
      return;
    }
    if (!newIncome.amount || parseFloat(newIncome.amount) <= 0) {
      return;
    }
    onSave(newIncome);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setNewIncome({ ...newIncome, amount: input });
  };

  return (
    <TableRow className="border-b border-gray-200">
      <TableCell className="py-2">
        <Input
          type="date"
          value={newIncome.date}
          onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
          className="h-8 text-sm w-40"
        />
      </TableCell>

      <TableCell className="py-2">
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {currencySymbol}
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={newIncome.amount}
            onChange={handleAmountChange}
            className="h-8 text-sm pl-6 w-32"
          />
        </div>
      </TableCell>

      <TableCell className="py-2">
        <Select 
          value={newIncome.category} 
          onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}
        >
          <SelectTrigger className="h-8 text-sm w-48">
            <SelectValue placeholder="Select category" />
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
      </TableCell>

      <TableCell className="py-2">
        <Input
          placeholder="Description"
          value={newIncome.description}
          onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }}
          className="h-8 text-sm"
        />
      </TableCell>

      <TableCell className="py-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={handleSave}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onCancel}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

