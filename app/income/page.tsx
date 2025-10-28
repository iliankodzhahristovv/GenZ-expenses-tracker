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
import { getIncomeAction, createIncomeAction, updateIncomeAction, deleteIncomeAction } from "@/actions/income";

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

/**
 * Income Page
 * 
 * Protected page - requires authentication
 */
export default function IncomePage() {
  const { user } = useCurrentUser();
  const [incomeEntries, setIncomeEntries] = useState<Income[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "category" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>({});

  const currencySymbol = getCurrencySymbol(user?.currency || "Dollar");

  // Load user categories and income from database
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load categories
      const categoriesResponse = await getUserCategoriesAction();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Load income
      const incomeResponse = await getIncomeAction();
      if (incomeResponse.success && incomeResponse.data) {
        setIncomeEntries(incomeResponse.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Filter income based on search query
  const filteredIncome = incomeEntries.filter((income) => {
    const query = searchQuery.toLowerCase();
    const convertedAmount = convertFromBaseCurrency(income.amount, user?.currency || "Dollar");
    return (
      income.description.toLowerCase().includes(query) ||
      income.category.toLowerCase().includes(query) ||
      income.date.includes(query) ||
      convertedAmount.toString().startsWith(query)
    );
  });

  // Sort income
  const sortedIncome = [...filteredIncome].sort((a, b) => {
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

  const handleAddIncome = async () => {
    // Trim and validate inputs
    const trimmedDescription = newIncome.description.trim();
    const trimmedAmount = newIncome.amount.trim();
    
    if (!trimmedDescription) {
      toast.error("Description is required", {
        description: "Please enter a description for this income.",
      });
      return;
    }

    if (!newIncome.category) {
      toast.error("Category is required", {
        description: "Please select a category for this income.",
      });
      return;
    }

    if (!trimmedAmount) {
      toast.error("Amount is required", {
        description: "Please enter an amount for this income.",
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

    // Create income in database
    const response = await createIncomeAction({
      date: newIncome.date,
      amount: parsedAmount,
      description: trimmedDescription,
      category: newIncome.category,
    });

    if (!response.success) {
      toast.error("Failed to add income", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    // Add to local state
    if (response.data) {
      setIncomeEntries((prev) => [response.data, ...prev]);
    }

    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setIsDialogOpen(false);
    toast.success("Income added", {
      description: `Added ${trimmedDescription} - ${currencySymbol}${parsedAmount.toFixed(2)}`,
    });
  };

  const handleEditIncome = async () => {
    if (!editingIncome) return;

    // Validate inputs
    const trimmedDescription = editingIncome.description.trim();
    
    if (!trimmedDescription) {
      toast.error("Description is required", {
        description: "Please enter a description for this income.",
      });
      return;
    }

    if (!editingIncome.category) {
      toast.error("Category is required", {
        description: "Please select a category for this income.",
      });
      return;
    }

    if (!isFinite(editingIncome.amount) || editingIncome.amount <= 0) {
      toast.error("Invalid amount", {
        description: "Amount must be greater than zero.",
      });
      return;
    }

    // Update income in database
    const response = await updateIncomeAction({
      id: editingIncome.id,
      date: editingIncome.date,
      amount: editingIncome.amount,
      description: trimmedDescription,
      category: editingIncome.category,
    });

    if (!response.success) {
      toast.error("Failed to update income", {
        description: response.error || "Something went wrong",
      });
      return;
    }

    // Update local state
    setIncomeEntries((prev) =>
      prev.map((inc) => (inc.id === editingIncome.id ? editingIncome : inc))
    );
    
    setIsEditDialogOpen(false);
    setEditingIncome(null);
    toast.success("Income updated", {
      description: `Updated ${trimmedDescription} - ${currencySymbol}${editingIncome.amount.toFixed(2)}`,
    });
  };

  const openEditDialog = (income: Income) => {
    setEditingIncome({ ...income });
    setIsEditDialogOpen(true);
  };

  // Convert total income to user's currency
  const totalIncomeInUserCurrency = incomeEntries.reduce((sum, income) => {
    const convertedAmount = convertFromBaseCurrency(income.amount, user?.currency || "Dollar");
    return sum + convertedAmount;
  }, 0);

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
                  Add Income
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Income</DialogTitle>
                  <DialogDescription>
                    Enter the details of your income below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={newIncome.date}
                        onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
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
                        value={newIncome.amount}
                        onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="What was this income for?"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newIncome.category} onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}>
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
                  <Button onClick={handleAddIncome} className="bg-black hover:bg-gray-800">
                    Add Income
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Income Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Income</DialogTitle>
                  <DialogDescription>
                    Update the details of your income below.
                  </DialogDescription>
                </DialogHeader>
                {editingIncome && (
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-date">Date</Label>
                      <div className="relative">
                        <Input
                          id="edit-date"
                          type="date"
                          value={editingIncome.date}
                          onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
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
                          value={editingIncome.amount}
                          onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) || 0 })}
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Input
                        id="edit-description"
                        placeholder="What was this income for?"
                        value={editingIncome.description}
                        onChange={(e) => setEditingIncome({ ...editingIncome, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select value={editingIncome.category} onValueChange={(value) => setEditingIncome({ ...editingIncome, category: value })}>
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
                  <Button onClick={handleEditIncome} className="bg-black hover:bg-gray-800">
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Income Table */}
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
                {sortedIncome.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                      {searchQuery ? "No income found matching your search." : "No income entries yet. Add your first income to get started!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedIncome.map((income) => {
                    const displayAmount = convertFromBaseCurrency(income.amount, user?.currency || "Dollar");
                    return (
                      <TableRow
                        key={income.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => openEditDialog(income)}
                      >
                        <TableCell className="font-medium">
                          {new Date(income.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          +{currencySymbol}{displayAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(income.category)}>
                            {income.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {income.description}
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

