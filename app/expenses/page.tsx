"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign, FileText, Tag, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/hooks/auth";
import { getCurrencySymbol, convertFromBaseCurrency } from "@/lib/currency-utils";

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

// Mock initial expenses
const initialExpenses: Expense[] = [
  { id: "1", date: "2025-10-25", amount: 299.00, description: "Adobe Creative Cloud annual subscription", category: "Software & Subscriptions" },
  { id: "2", date: "2025-10-24", amount: 1250.00, description: "Google Ads campaign for Q4", category: "Marketing & Advertising" },
  { id: "3", date: "2025-10-23", amount: 450.00, description: "Business lunch with potential client", category: "Client Entertainment" },
  { id: "4", date: "2025-10-22", amount: 85.50, description: "Office supplies - printer paper and toner", category: "Office Supplies" },
  { id: "5", date: "2025-10-21", amount: 500.00, description: "Legal consultation for contract review", category: "Professional Services" },
];

const categories = [
  "Office Supplies",
  "Marketing & Advertising",
  "Software & Subscriptions",
  "Travel & Transportation",
  "Client Entertainment",
  "Professional Services",
  "Utilities & Rent",
  "Equipment & Hardware",
  "Employee Benefits",
  "Other"
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Office Supplies": "bg-blue-100 text-blue-700",
    "Marketing & Advertising": "bg-purple-100 text-purple-700",
    "Software & Subscriptions": "bg-indigo-100 text-indigo-700",
    "Travel & Transportation": "bg-cyan-100 text-cyan-700",
    "Client Entertainment": "bg-pink-100 text-pink-700",
    "Professional Services": "bg-amber-100 text-amber-700",
    "Utilities & Rent": "bg-orange-100 text-orange-700",
    "Equipment & Hardware": "bg-green-100 text-green-700",
    "Employee Benefits": "bg-emerald-100 text-emerald-700",
    "Other": "bg-gray-100 text-gray-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

/**
 * Expenses Page
 * 
 * Protected page - requires authentication
 */
export default function ExpensesPage() {
  const { user } = useCurrentUser();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });

  const currencySymbol = getCurrencySymbol(user?.currency || "Dollar");

  const handleAddExpense = () => {
    // Trim and validate inputs
    const trimmedDescription = newExpense.description.trim();
    const trimmedAmount = newExpense.amount.trim();
    
    if (!trimmedDescription) {
      toast.error("Description is required", {
        description: "Please enter a description for this expense.",
      });
      return;
    }

    if (!newExpense.category) {
      toast.error("Category is required", {
        description: "Please select a category for this expense.",
      });
      return;
    }

    if (!trimmedAmount) {
      toast.error("Amount is required", {
        description: "Please enter an amount for this expense.",
      });
      return;
    }

    // Parse and validate amount
    const parsedAmount = parseFloat(trimmedAmount);
    
    if (!isFinite(parsedAmount)) {
      toast.error("Invalid amount", {
        description: "Please enter a valid number for the amount.",
      });
      return;
    }

    if (parsedAmount <= 0) {
      toast.error("Invalid amount", {
        description: "Amount must be greater than zero.",
      });
      return;
    }

    // Create expense after validation
    const expense: Expense = {
      id: crypto.randomUUID(),
      date: newExpense.date,
      amount: parsedAmount,
      description: trimmedDescription,
      category: newExpense.category,
    };

    setExpenses((prev) => [expense, ...prev]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setIsDialogOpen(false);
    toast.success("Expense added", {
      description: `Added ${trimmedDescription} - $${parsedAmount.toFixed(2)}`,
    });
  };

  const handleEditExpense = () => {
    if (!editingExpense) return;

    // Validate inputs
    const trimmedDescription = editingExpense.description.trim();
    
    if (!trimmedDescription) {
      toast.error("Description is required", {
        description: "Please enter a description for this expense.",
      });
      return;
    }

    if (!editingExpense.category) {
      toast.error("Category is required", {
        description: "Please select a category for this expense.",
      });
      return;
    }

    if (!isFinite(editingExpense.amount) || editingExpense.amount <= 0) {
      toast.error("Invalid amount", {
        description: "Amount must be greater than zero.",
      });
      return;
    }

    // Update expense
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === editingExpense.id ? editingExpense : exp))
    );
    
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    toast.success("Expense updated", {
      description: `Updated ${trimmedDescription} - $${editingExpense.amount.toFixed(2)}`,
    });
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense({ ...expense });
    setIsEditDialogOpen(true);
  };

  // Convert total expenses to user's currency
  const totalExpensesInUserCurrency = expenses.reduce((sum, expense) => {
    const convertedAmount = convertFromBaseCurrency(expense.amount, user?.currency || "Dollar");
    return sum + convertedAmount;
  }, 0);

  return (
    <ProtectedLayout>
      <Toaster />
      <div className="p-6 bg-[#F7F7F7]">
        <div className="max-w-5xl mx-auto">
          {/* Header with Add Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: {currencySymbol}{totalExpensesInUserCurrency.toFixed(2)}
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-black hover:bg-gray-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
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
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense} className="bg-black hover:bg-gray-800">
                    Add Expense
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Expense</DialogTitle>
                  <DialogDescription>
                    Update the details of your expense below.
                  </DialogDescription>
                </DialogHeader>
                {editingExpense && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Date</Label>
                      <div className="relative">
                        <Input
                          id="edit-date"
                          type="date"
                          value={editingExpense.date}
                          onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                          className="[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <Input
                          id="edit-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editingExpense.amount}
                          onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Input
                        id="edit-description"
                        placeholder="What was this expense for?"
                        value={editingExpense.description}
                        onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select value={editingExpense.category} onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditExpense} className="bg-black hover:bg-gray-800">
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Expenses List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No expenses yet. Add your first expense to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => {
                    const displayAmount = convertFromBaseCurrency(expense.amount, user?.currency || "Dollar");
                    return (
                    <div
                      key={expense.id}
                      className="group flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{expense.description}</p>
                          <Badge className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {currencySymbol}{displayAmount.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(expense)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}

