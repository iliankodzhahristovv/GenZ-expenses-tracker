"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Record<string, Array<{ id: string; icon: string; name: string }>>;
  currencySymbol: string;
  onAdd: (expense: { date: string; amount: string; description: string; category: string }) => void;
}

export function AddExpenseDialog({
  open,
  onOpenChange,
  categories,
  currencySymbol,
  onAdd,
}: AddExpenseDialogProps) {
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });
  const [error, setError] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear form and errors when closing
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        description: "",
        category: "",
      });
      setError("");
    }
    onOpenChange(open);
  };

  const handleAdd = () => {
    // Clear previous errors
    setError("");

    // Validate description
    const trimmedDescription = newExpense.description.trim();
    if (!trimmedDescription) {
      setError("Description is required");
      return;
    }

    // Validate category
    if (!newExpense.category) {
      setError("Please select a category");
      return;
    }

    // Validate amount
    const parsedAmount = parseFloat(newExpense.amount);
    if (!newExpense.amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    // Validate date
    if (!newExpense.date) {
      setError("Date is required");
      return;
    }

    // All validations passed - call onAdd
    onAdd(newExpense);
    
    // Reset form
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details of your expense below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => {
                  setNewExpense({ ...newExpense, date: e.target.value });
                  setError("");
                }}
                className="[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={newExpense.amount}
                onChange={(e) => {
                  setNewExpense({ ...newExpense, amount: e.target.value });
                  setError("");
                }}
                className="pl-7"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={newExpense.description}
              onChange={(e) => {
                setNewExpense({ ...newExpense, description: e.target.value });
                setError("");
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={newExpense.category} 
              onValueChange={(value) => {
                setNewExpense({ ...newExpense, category: value });
                setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 px-6 pb-2">
            {error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} className="bg-black hover:bg-gray-800">
            Add Expense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

