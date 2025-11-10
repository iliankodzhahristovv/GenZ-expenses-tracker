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

  const handleAdd = () => {
    onAdd(newExpense);
    // Reset form
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
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
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
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
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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

