"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/hooks/auth";
import { getCurrencySymbol, convertFromBaseCurrency, convertToBaseCurrency } from "@/lib/currency-utils";
import { getUserCategoriesAction } from "@/actions/categories";
import { getIncomeAction, createIncomeAction, updateIncomeAction, deleteIncomeAction } from "@/actions/income";
import { IncomeTableRow } from "@/components/income/income-table-row";
import { AddIncomeRow } from "@/components/income/add-income-row";
import { DeleteIncomeDialog } from "@/components/income/delete-income-dialog";
import { IncomeSearch } from "@/components/income/income-search";

interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    "Client Projects": "bg-blue-100 text-blue-700",
    "Recurring Revenue": "bg-green-100 text-green-700",
    "Consulting": "bg-purple-100 text-purple-700",
    "Product Sales": "bg-indigo-100 text-indigo-700",
    "Service Fees": "bg-cyan-100 text-cyan-700",
    "Licensing": "bg-amber-100 text-amber-700",
    "Commission": "bg-orange-100 text-orange-700",
    "Grants & Funding": "bg-emerald-100 text-emerald-700",
    "Investment Income": "bg-pink-100 text-pink-700",
    "Other": "bg-gray-100 text-gray-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

export default function IncomePage() {
  const { user } = useCurrentUser();
  const [income, setIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "category" | null>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>({});

  const currencySymbol = getCurrencySymbol(user?.currency || "Dollar");

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesResponse = await getUserCategoriesAction();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    };
    loadCategories();
  }, []);

  // Load income
  const loadIncome = async () => {
    setIsLoading(true);
    const response = await getIncomeAction();
    if (response.success && response.data) {
      setIncome(response.data as any);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadIncome();
  }, []);

  // Filter income
  const filteredIncome = income.filter((inc) => {
    const query = searchQuery.toLowerCase();
    const convertedAmount = convertFromBaseCurrency(inc.amount, user?.currency || "Dollar");
    return (
      inc.description.toLowerCase().includes(query) ||
      inc.category.toLowerCase().includes(query) ||
      inc.date.includes(query) ||
      convertedAmount.toString().startsWith(query)
    );
  });

  // Sort income
  const sortedIncome = [...filteredIncome].sort((a, b) => {
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

  const handleSort = (field: "date" | "amount" | "category") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const handleAddIncome = async (inc: { date: string; amount: string; description: string; category: string }) => {
    const trimmedDescription = inc.description.trim();
    const parsedAmount = parseFloat(inc.amount);
    
    if (!trimmedDescription) {
      toast.error("Description is required");
      return;
    }
    if (!inc.category) {
      toast.error("Category is required");
      return;
    }
    if (!isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    const baseAmount = convertToBaseCurrency(parsedAmount, user?.currency || "Dollar");

    const response = await createIncomeAction({
      date: inc.date,
      amount: baseAmount,
      description: trimmedDescription,
      category: inc.category,
    });

    if (!response.success) {
      toast.error("Failed to add income", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    await loadIncome();
    setIsAddingRow(false);
    toast.success("Income added");
  };

  const handleUpdateIncome = async (updatedIncome: Income) => {
    const response = await updateIncomeAction({
      id: updatedIncome.id,
      date: updatedIncome.date,
      amount: updatedIncome.amount,
      description: updatedIncome.description.trim(),
      category: updatedIncome.category,
    });

    if (!response.success) {
      toast.error("Failed to update income", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    await loadIncome();
  };

  const openDeleteDialog = (inc: Income, e: React.MouseEvent) => {
    e.stopPropagation();
    setIncomeToDelete(inc);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteIncome = async () => {
    if (!incomeToDelete) return;

    const response = await deleteIncomeAction(incomeToDelete.id);

    if (!response.success) {
      toast.error("Failed to delete income", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    await loadIncome();
    setIsDeleteDialogOpen(false);
    setIncomeToDelete(null);
    toast.success("Income deleted", {
      description: `Deleted ${incomeToDelete.description}`,
    });
  };

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
        <IncomeSearch value={searchQuery} onChange={setSearchQuery} />

        <DeleteIncomeDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDeleteIncome}
        />

        {/* Income Table */}
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
              {isAddingRow && (
                <AddIncomeRow
                  currencySymbol={currencySymbol}
                  categories={categories}
                  onSave={handleAddIncome}
                  onCancel={() => setIsAddingRow(false)}
                />
              )}
              {sortedIncome.length === 0 && !isAddingRow ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    {searchQuery ? "No income found matching your search." : "No income entries yet. Add your first income to get started!"}
                  </TableCell>
                </TableRow>
              ) : (
                sortedIncome.map((inc) => {
                  const displayAmount = convertFromBaseCurrency(inc.amount, user?.currency || "Dollar");
                  const safeDisplayAmount = Number.isFinite(displayAmount) ? displayAmount : inc.amount;
                  
                  let categoryIcon = "";
                  Object.values(categories).forEach((categoryGroup) => {
                    const found = categoryGroup.find((cat) => cat.name === inc.category);
                    if (found) categoryIcon = found.icon;
                  });
                  
                  return (
                    <IncomeTableRow
                      key={inc.id}
                      income={inc}
                      displayAmount={safeDisplayAmount}
                      currencySymbol={currencySymbol}
                      userCurrency={user?.currency || "Dollar"}
                      categoryIcon={categoryIcon}
                      categoryColor={getCategoryColor(inc.category)}
                      categories={categories}
                      onUpdate={handleUpdateIncome}
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

