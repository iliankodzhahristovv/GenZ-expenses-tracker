"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/hooks/auth";
import { useExpenses, type Expense } from "@/hooks/expenses";
import { getCurrencySymbol, convertFromBaseCurrency, convertToBaseCurrency } from "@/lib/currency-utils";
import { getUserCategoriesAction } from "@/actions/categories";
import { createExpenseAction, updateExpenseAction, deleteExpenseAction } from "@/actions/expenses";
import { ExpenseTableRow } from "@/components/expenses/expense-table-row";
import { AddExpenseRow } from "@/components/expenses/add-expense-row";
import { DeleteExpenseDialog } from "@/components/expenses/delete-expense-dialog";
import { ExpenseSearch } from "@/components/expenses/expense-search";


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
  const { expenses, isLoading, mutate: refreshExpenses } = useExpenses();
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "category" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>({});

  const currencySymbol = getCurrencySymbol(user?.currency || "USD");

  // Load user categories - eagerly load before anything else
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesResponse = await getUserCategoriesAction();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    };

    loadCategories();
  }, []);

  // Don't render table until categories are loaded
  const areCategoriesLoaded = Object.keys(categories).length > 0;

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter((expense) => {
    const query = searchQuery.toLowerCase();
    const convertedAmount = convertFromBaseCurrency(expense.amount, user?.currency || "USD");
    return (
      expense.description.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query) ||
      expense.date.includes(query) ||
      convertedAmount.toString().startsWith(query)
    );
  });

  // Sort expenses - default sort by date descending (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
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

  const handleAddExpense = async (expense: { date: string; amount: string; description: string; category: string }) => {
    const trimmedDescription = expense.description.trim();
    const parsedAmount = parseFloat(expense.amount);
    
    if (!trimmedDescription) {
      toast.error("Description is required");
      return;
    }

    if (!expense.category) {
      toast.error("Category is required");
      return;
    }

    if (!isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    // Convert from user's display currency to base currency (USD) for storage
    const baseAmount = convertToBaseCurrency(parsedAmount, user?.currency || "USD");

    const response = await createExpenseAction({
      date: expense.date,
      amount: baseAmount,
      description: trimmedDescription,
      category: expense.category,
    });

    if (!response.success) {
      toast.error("Failed to add expense", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    await refreshExpenses();
    setIsAddingRow(false);
    toast.success("Expense added");
  };

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    const response = await updateExpenseAction({
      id: updatedExpense.id,
      date: updatedExpense.date,
      amount: updatedExpense.amount,
      description: updatedExpense.description.trim(),
      category: updatedExpense.category,
    });

    if (!response.success) {
      toast.error("Failed to update expense", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    await refreshExpenses();
  };

  const openDeleteDialog = (expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    const response = await deleteExpenseAction(expenseToDelete.id);

    if (!response.success) {
      toast.error("Failed to delete expense", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    // Refresh expenses data from server (updates both this page and dashboard)
    await refreshExpenses();
    
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
    toast.success("Expense deleted", {
      description: `Deleted ${expenseToDelete.description}`,
    });
  };

  // Convert total expenses to user's currency
  const totalExpensesInUserCurrency = expenses.reduce((sum, expense) => {
    const convertedAmount = convertFromBaseCurrency(expense.amount, user?.currency || "USD");
    return sum + convertedAmount;
  }, 0);

  return (
    <ProtectedLayout
      headerActions={
        <Button 
          size="icon" 
          className="h-7 w-7 bg-black hover:bg-gray-800"
          onClick={() => setIsAddingRow(true)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      }
    >
      <Toaster />
      <div className="px-6 py-6 bg-[#F7F7F7] min-h-screen">
        <ExpenseSearch value={searchQuery} onChange={setSearchQuery} />

        <DeleteExpenseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteExpense}
        />

        {/* Expenses Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-white hover:bg-white">
                  <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider py-4">
                    <Button
                    variant="ghost"
                    onClick={() => handleSort("date")}
                    className="hover:bg-transparent p-0 h-auto font-medium text-xs uppercase"
                  >
                    Date
                    {getSortIcon("date")}
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider py-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("amount")}
                    className="hover:bg-transparent p-0 h-auto font-medium text-xs uppercase"
                  >
                    Amount
                    {getSortIcon("amount")}
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider py-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("category")}
                    className="hover:bg-transparent p-0 h-auto font-medium text-xs uppercase"
                  >
                    Category
                    {getSortIcon("category")}
                  </Button>
                </TableHead>
                <TableHead className="text-xs font-medium text-gray-500 uppercase tracking-wider py-4">Description</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAddingRow && areCategoriesLoaded && (
                <AddExpenseRow
                  currencySymbol={currencySymbol}
                  categories={categories}
                  onSave={handleAddExpense}
                  onCancel={() => setIsAddingRow(false)}
                />
              )}
              {(isLoading || !areCategoriesLoaded) ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : sortedExpenses.length === 0 && !isAddingRow ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    {searchQuery ? "No expenses found matching your search." : "No expenses yet. Add your first expense to get started!"}
                  </TableCell>
                </TableRow>
              ) : (
                sortedExpenses.map((expense) => {
                  const displayAmount = convertFromBaseCurrency(expense.amount, user?.currency || "USD");
                  const safeDisplayAmount = Number.isFinite(displayAmount) ? displayAmount : expense.amount;
                  
                  // Find the category icon
                  let categoryIcon = "";
                  Object.values(categories).forEach((categoryGroup) => {
                    const found = categoryGroup.find((cat) => cat.name === expense.category);
                    if (found) categoryIcon = found.icon;
                  });
                  
                  return (
                    <ExpenseTableRow
                      key={expense.id}
                      expense={expense}
                      displayAmount={safeDisplayAmount}
                      currencySymbol={currencySymbol}
                      userCurrency={user?.currency || "USD"}
                      categoryIcon={categoryIcon}
                      categoryColor={getCategoryColor(expense.category)}
                      categories={categories}
                      onUpdate={handleUpdateExpense}
                      onDelete={openDeleteDialog}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ProtectedLayout>
  );
}

