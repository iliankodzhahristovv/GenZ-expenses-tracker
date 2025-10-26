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
import { Plus, Calendar, DollarSign, FileText, Tag } from "lucide-react";

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
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.category) {
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setIsDialogOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <ProtectedLayout>
      <div className="p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header with Add Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: ${totalExpenses.toFixed(2)}
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
                    <Label htmlFor="date">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">
                      <DollarSign className="h-4 w-4 inline mr-2" />
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="What was this expense for?"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">
                      <Tag className="h-4 w-4 inline mr-2" />
                      Category
                    </Label>
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
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
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
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${expense.amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}

