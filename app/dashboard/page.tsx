"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout";
import { useCurrentUser } from "@/hooks/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MapPin, Target, TrendingUp, CreditCard, X, Landmark, Coffee, ShoppingBag } from "lucide-react";

// Types
interface SpendingPoint {
  day: string;
  currentMonth: number;
  lastMonth: number;
}

interface Transaction {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecurringCharge {
  id: number;
  merchant: string;
  frequency: string;
  amount: number;
  daysLeft: number;
}

// Mock data
const spendingData: SpendingPoint[] = [
  { day: "Day 6", currentMonth: 800, lastMonth: 750 },
  { day: "Day 9", currentMonth: 950, lastMonth: 920 },
  { day: "Day 12", currentMonth: 1100, lastMonth: 1050 },
  { day: "Day 15", currentMonth: 1050, lastMonth: 1150 },
  { day: "Day 18", currentMonth: 1200, lastMonth: 1180 },
  { day: "Day 21", currentMonth: 1350, lastMonth: 1300 },
  { day: "Day 24", currentMonth: 1400, lastMonth: 1420 },
  { day: "Day 27", currentMonth: 1380, lastMonth: 1450 },
  { day: "Day 30", currentMonth: 1209, lastMonth: 1380 },
];

const transactions: Transaction[] = [
  { id: 1, merchant: "Google Workspace", category: "Software", amount: 109.00, icon: ShoppingBag, color: "bg-indigo-100 text-indigo-600" },
  { id: 2, merchant: "LinkedIn Ads", category: "Marketing", amount: 850.00, icon: ShoppingBag, color: "bg-purple-100 text-purple-600" },
  { id: 3, merchant: "Client Lunch", category: "Entertainment", amount: 153.00, icon: Coffee, color: "bg-pink-100 text-pink-600" },
  { id: 4, merchant: "Office Depot", category: "Office Supplies", amount: 78.00, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
  { id: 5, merchant: "AWS", category: "Infrastructure", amount: 243.00, icon: ShoppingBag, color: "bg-green-100 text-green-600" },
];

const recurringCharges: RecurringCharge[] = [
  { id: 1, merchant: "Slack Workspace", frequency: "Every month", amount: 180.00, daysLeft: 27 },
  { id: 2, merchant: "Adobe Creative Cloud", frequency: "Every month", amount: 299.99, daysLeft: 10 },
  { id: 3, merchant: "Office Rent", frequency: "Every month", amount: 2500.00, daysLeft: 15 },
  { id: 4, merchant: "Insurance Premium", frequency: "Every 3 months", amount: 450.00, daysLeft: 7 },
];

/**
 * Dashboard Page
 * 
 * Protected page - requires authentication
 */
export default function DashboardPage() {
  const { user } = useCurrentUser();
  const [hideGettingStarted, setHideGettingStarted] = useState(false);

  const currentMonthYear = new Date().toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <ProtectedLayout>
      <div className="p-6 bg-gray-50">
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
                      <p className="text-2xl font-semibold mt-1">$1,209.00 this month</p>
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
                      <Tooltip />
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
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${transaction.color}`}>
                            <transaction.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.merchant}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">${transaction.amount.toFixed(2)}</span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Charges */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Recurring</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">$85.07 remaining due</p>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700">This month</button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recurringCharges.map((charge) => (
                      <div
                        key={charge.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs">💳</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{charge.merchant}</p>
                            <p className="text-xs text-gray-500">{charge.frequency}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">${charge.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">in {charge.daysLeft} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Investments */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">$250,000 investments</span>
                      <span className="text-sm text-green-600">→ $37.26 (0%)</span>
                    </div>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Top movers today</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

