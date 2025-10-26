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
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";

interface Income {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

// Mock initial income
const initialIncome: Income[] = [
  { id: "1", date: "2025-10-25", amount: 5500.00, description: "Website development project for Tech Corp", category: "Client Projects" },
  { id: "2", date: "2025-10-20", amount: 2800.00, description: "Monthly retainer - Digital Marketing Services", category: "Recurring Revenue" },
  { id: "3", date: "2025-10-15", amount: 1200.00, description: "Consulting session - Strategy Planning", category: "Consulting" },
  { id: "4", date: "2025-10-12", amount: 850.00, description: "Product sale - Premium Package", category: "Product Sales" },
  { id: "5", date: "2025-10-08", amount: 3400.00, description: "Brand identity design for startup", category: "Client Projects" },
];

const categories = [
  "Client Projects",
  "Recurring Revenue",
  "Consulting",
  "Product Sales",
  "Service Fees",
  "Licensing",
  "Commission",
  "Grants & Funding",
  "Investment Income",
  "Other"
];

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
  const [incomeEntries, setIncomeEntries] = useState<Income[]>(initialIncome);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    description: "",
    category: "",
  });

  const handleAddIncome = () => {
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

    // Create income after validation
    const income: Income = {
      id: crypto.randomUUID(),
      date: newIncome.date,
      amount: parsedAmount,
      description: trimmedDescription,
      category: newIncome.category,
    };

    setIncomeEntries((prev) => [income, ...prev]);
    setNewIncome({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      description: "",
      category: "",
    });
    setIsDialogOpen(false);
    toast.success("Income added", {
      description: `Added ${trimmedDescription} - $${parsedAmount.toFixed(2)}`,
    });
  };

  const totalIncome = incomeEntries.reduce((sum, income) => sum + income.amount, 0);

  return (
    <ProtectedLayout>
      <Toaster />
      <div className="p-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* Header with Add Button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Income</h1>
              <p className="text-sm text-gray-600 mt-1">
                Total: ${totalIncome.toFixed(2)}
              </p>
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
                    <Label htmlFor="date">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newIncome.date}
                      onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
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
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="What was this income for?"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">
                      <Tag className="h-4 w-4 inline mr-2" />
                      Category
                    </Label>
                    <Select value={newIncome.category} onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}>
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
                  <Button onClick={handleAddIncome} className="bg-black hover:bg-gray-800">
                    Add Income
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Income List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Income</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeEntries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No income entries yet. Add your first income to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomeEntries.map((income) => (
                    <div
                      key={income.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{income.description}</p>
                          <Badge className={getCategoryColor(income.category)}>
                            {income.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(income.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          +${income.amount.toFixed(2)}
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

