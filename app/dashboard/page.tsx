"use client";

import { useState, useMemo, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { useCurrentUser } from "@/hooks/auth";
import { useExpenses } from "@/hooks/expenses";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { MapPin, Target, CreditCard, Landmark } from "lucide-react";
import { getCurrencySymbol, convertFromBaseCurrency } from "@/lib/currency-utils";
import { getUserCategoriesAction } from "@/actions/categories";

// Types
interface SpendingPoint {
  day: string;
  currentMonth: number;
  lastMonth: number;
}

// Mock data removed - now using real expenses data

// Helper function to get category color
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
 * Dashboard Page
 * 
 * Protected page - requires authentication
 */
export default function DashboardPage() {
  const { user } = useCurrentUser();
  const { expenses, isLoading: isLoadingExpenses, mutate: refreshExpenses } = useExpenses();
  const [hideGettingStarted, setHideGettingStarted] = useState(false);
  const [categories, setCategories] = useState<Record<string, Array<{ id: string; icon: string; name: string }>>>({});

  const currentMonthYear = new Date().toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  const currencySymbol = getCurrencySymbol(user?.currency || "USD");
  const userCurrency = user?.currency || "USD";

  // Load user categories
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesResponse = await getUserCategoriesAction();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    };

    loadCategories();
  }, []);

  // Calculate spending data from real expenses
  const spendingData = useMemo(() => {
    // Helper function to convert ISO date string to local date (fixes timezone regression)
    const toLocalDate = (isoDate: string) => {
      const [year, month, day] = isoDate.split("-").map(Number);
      return new Date(year, month - 1, day);
    };
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get last month's date
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter expenses by month (using local date to avoid timezone issues)
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = toLocalDate(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const lastMonthExpenses = expenses.filter(expense => {
      const expenseDate = toLocalDate(expense.date);
      return expenseDate.getMonth() === lastMonth && expenseDate.getFullYear() === lastMonthYear;
    });
    
    // Debug logging
    console.log('📊 Graph Debug Info:', {
      currentMonth,
      lastMonth,
      totalExpenses: expenses.length,
      currentMonthExpensesCount: currentMonthExpenses.length,
      lastMonthExpensesCount: lastMonthExpenses.length,
      lastMonthExpenses: lastMonthExpenses.map(e => ({ date: e.date, amount: e.amount }))
    });
    
    // Get days in each month
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInLastMonth = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
    
    // Calculate cumulative spending by day
    const calculateCumulativeByDay = (expensesArray: Array<{ date: string; amount: number }>, daysInMonth: number) => {
      const dailyTotals: { [key: number]: number } = {};
      
      expensesArray.forEach(expense => {
        const expenseDate = toLocalDate(expense.date);
        const day = expenseDate.getDate();
        if (!dailyTotals[day]) {
          dailyTotals[day] = 0;
        }
        const convertedAmount = convertFromBaseCurrency(expense.amount, userCurrency);
        // Round to 2 decimal places to avoid floating point precision issues
        dailyTotals[day] += Math.round(convertedAmount * 100) / 100;
      });
      
      // Convert to cumulative
      let cumulative = 0;
      const cumulativeByDay: { [key: number]: number } = {};
      for (let day = 1; day <= daysInMonth; day++) {
        cumulative += dailyTotals[day] || 0;
        // Round cumulative total to 2 decimal places
        cumulativeByDay[day] = Math.round(cumulative * 100) / 100;
      }
      
      return cumulativeByDay;
    };
    
    const currentMonthCumulative = calculateCumulativeByDay(currentMonthExpenses, daysInCurrentMonth);
    const lastMonthCumulative = calculateCumulativeByDay(lastMonthExpenses, daysInLastMonth);
    
    // Sample 9 points across the month for chart
    // Use the maximum days to ensure we capture all data
    const maxDays = Math.max(daysInCurrentMonth, daysInLastMonth);
    const points = [];
    const interval = Math.floor(maxDays / 8);
    
    for (let i = 0; i < 9; i++) {
      const day = Math.min(1 + (i * interval), maxDays);
      const currentValue = currentMonthCumulative[Math.min(day, daysInCurrentMonth)] || 0;
      const lastValue = lastMonthCumulative[Math.min(day, daysInLastMonth)] || 0;
      
      points.push({
        day: `Day ${day}`,
        currentMonth: Math.round(currentValue * 100) / 100,
        lastMonth: Math.round(lastValue * 100) / 100,
      });
    }
    
    // Always show the final cumulative values at the end
    if (points.length > 0) {
      const finalCurrentValue = currentMonthCumulative[daysInCurrentMonth] || 0;
      const finalLastValue = lastMonthCumulative[daysInLastMonth] || 0;
      
      points[points.length - 1] = {
        day: `Day ${maxDays}`,
        currentMonth: Math.round(finalCurrentValue * 100) / 100,
        lastMonth: Math.round(finalLastValue * 100) / 100,
      };
    }
    
    return points;
  }, [expenses, userCurrency]);

  // Calculate current month total
  const currentMonthTotal = useMemo(() => {
    // Helper function to convert ISO date string to local date (fixes timezone regression)
    const toLocalDate = (isoDate: string) => {
      const [year, month, day] = isoDate.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses
      .filter(expense => {
        const expenseDate = toLocalDate(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => {
        return sum + convertFromBaseCurrency(expense.amount, userCurrency);
      }, 0);
  }, [expenses, userCurrency]);

  // Custom tooltip component to display currency symbol
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-xs text-gray-500 mb-1">{payload[0].payload.day}</p>
          {payload.map((entry, index) => {
            // Round to 2 decimal places and force .00 format
            const value = entry.value as number;
            const formattedValue = (Math.round(value * 100) / 100).toFixed(2);
            return (
              <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name} : {currencySymbol}{formattedValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <ProtectedLayout>
      <div className="p-6 bg-[#F7F7F7]">
        <div className="max-w-[1600px] mx-auto">
          <p className="text-sm text-gray-500 mb-6">Good evening, {user?.displayName?.split(" ")[0] || "User"}!</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Getting Started Widget */}
              {!hideGettingStarted && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Getting Started</CardTitle>
                    <CardDescription>{user?.displayName?.split(" ")[0] || "there"}, let&apos;s finish setting up your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Landmark className="h-4 w-4" />
                      <span>Add an account</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Customize categories</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Target className="h-4 w-4" />
                      <span>Create a goal</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Create a budget</span>
                    </div>
                    <button
                      onClick={() => setHideGettingStarted(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                    >
                      Hide this widget
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* Budget Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Budget</CardTitle>
                    <span className="text-sm text-gray-500">{currentMonthYear}</span>
                  </div>
                  <Select defaultValue="expenses">
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expenses">Expenses</SelectItem>
                      <SelectItem value="groceries">Groceries</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500 mb-2">You don&apos;t have a budget yet</p>
                    <p className="text-xs text-gray-400 mb-4">
                      We&apos;ll create one for you based on your spending history.
                    </p>
                    <Button variant="outline" size="sm">
                      Create my budget
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Score Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Credit score
                    <span className="text-gray-400">ⓘ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Turn on credit score tracking
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Keep track of your credit score right in your dashboard.
                    </p>
                    <Button variant="outline" size="sm">
                      Enable credit score
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Spending Chart */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Spending</CardTitle>
                      <p className="text-2xl font-semibold mt-1">
                        {currencySymbol}{currentMonthTotal.toFixed(2)} this month
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <button className="px-3 py-1 rounded-md hover:bg-gray-100">
                        This month vs. last month
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={spendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="lastMonth" stroke="#ffc0cb" strokeWidth={2} dot={false} name="Last month" />
                      <Line type="monotone" dataKey="currentMonth" stroke="#999999" strokeWidth={2} dot={false} name="This month" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-200 rounded-full"></div>
                      <span>Last month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span>This month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* All Transactions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">All transactions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingExpenses ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      Loading expenses...
                    </div>
                  ) : expenses.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No expenses yet. Add your first expense to see it here.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {expenses.slice(0, 5).map((expense) => {
                        const displayAmount = convertFromBaseCurrency(expense.amount, userCurrency);
                        
                        // Find the category icon
                        let categoryIcon = "🛒";
                        Object.values(categories).forEach((categoryGroup) => {
                          const found = categoryGroup.find((cat) => cat.name === expense.category);
                          if (found) categoryIcon = found.icon;
                        });
                        
                        return (
                          <div
                            key={expense.id}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getCategoryColor(expense.category)} flex items-center justify-center text-lg`}>
                                {categoryIcon}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                                <p className="text-xs text-gray-500">{expense.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold">{currencySymbol}{displayAmount.toFixed(2)}</span>
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
        </div>
      </div>
    </ProtectedLayout>
  );
}

