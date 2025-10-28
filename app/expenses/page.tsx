"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/hooks/auth";
import { getCurrencySymbol, convertFromBaseCurrency } from "@/lib/currency-utils";
import { getUserCategoriesAction } from "@/actions/categories";
import { getExpensesAction, createExpenseAction, updateExpenseAction } from "@/actions/expenses";

interface Expense {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}


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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "category" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>({});

  const currencySymbol = getCurrencySymbol(user?.currency || "Dollar");

  // Load user categories and expenses from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load categories
      const categoriesResponse = await getUserCategoriesAction();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Load expenses
      const expensesResponse = await getExpensesAction();
      if (expensesResponse.success && expensesResponse.data) {
        setExpenses(expensesResponse.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    const convertedAmount = convertFromBaseCurrency(expense.amount, user?.currency || "Dollar");
    const safeAmount = Number.isFinite(convertedAmount) ? convertedAmount : expense.amount;
    return (
      expense.description.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query) ||
      expense.date.includes(query) ||
      safeAmount.toString().startsWith(query)
    );
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;
    if (sortField === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortField === "category") {
      comparison = a.category.localeCompare(b.category);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Toggle sort
  const handleSort = (field: "date" | "amount" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: "date" | "amount" | "category") => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const handleAddExpense = async () => {
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

    // Create expense in database
    const response = await createExpenseAction({
      date: newExpense.date,
      amount: parsedAmount,
      description: trimmedDescription,
      category: newExpense.category,
    });

    if (!response.success) {
      toast.error("Failed to add expense", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    // Add to local state
    if (response.data) {
      setExpenses((prev) => [response.data, ...prev]);
    }

    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setIsDialogOpen(false);
    toast.success("Expense added", {
      description: `Added ${trimmedDescription} - ${currencySymbol}${parsedAmount.toFixed(2)}`,
    });
  };

  const handleEditExpense = async () => {
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

    // Update expense in database
    const response = await updateExpenseAction({
      id: editingExpense.id,
      date: editingExpense.date,
      amount: editingExpense.amount,
      description: trimmedDescription,
      category: editingExpense.category,
    });

    if (!response.success) {
      toast.error("Failed to update expense", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    // Update local state
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === editingExpense.id ? editingExpense : exp))
    );
    
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    toast.success("Expense updated", {
      description: `Updated ${trimmedDescription} - ${currencySymbol}${editingExpense.amount.toFixed(2)}`,
    });
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense({ ...expense });
    setIsEditDialogOpen(true);
  };

  // Convert total expenses to user's currency using integer minor-units (cents) for precision
  const totalExpensesInUserCurrency = expenses.reduce((sumInCents, expense) => {
    const convertedAmount = convertFromBaseCurrency(expense.amount, user?.currency || "USD");
    const safeAmount = Number.isFinite(convertedAmount) ? convertedAmount : expense.amount;
    // Convert to cents (minor units) to avoid floating-point precision errors
    const amountInCents = Math.round(safeAmount * 100);
    return sumInCents + amountInCents;
  }, 0) / 100; // Convert back to major units (dollars, euros, etc.)

  return (
    <ProtectedLayout>
      <Toaster />
      <div className="p-6 bg-[#F7F7F7] min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Search and Actions Bar */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white"
              />
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

          {/* Expenses Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("date")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Date
                      {getSortIcon("date")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("amount")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Amount
                      {getSortIcon("amount")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("category")}
                      className="hover:bg-transparent p-0 h-auto font-medium"
                    >
                      Category
                      {getSortIcon("category")}
                    </Button>
                  </TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      {searchQuery ? "No expenses found matching your search." : "No expenses yet. Add your first expense to get started!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedExpenses.map((expense) => {
                    const displayAmount = convertFromBaseCurrency(expense.amount, user?.currency || "Dollar");
                    const safeDisplayAmount = Number.isFinite(displayAmount) ? displayAmount : expense.amount;
                    return (
                      <TableRow
                        key={expense.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => openEditDialog(expense)}
                      >
                        <TableCell className="font-medium">
                          {new Date(expense.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {currencySymbol}{safeDisplayAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(expense.category)}>
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense.description}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

