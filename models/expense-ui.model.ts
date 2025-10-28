/**
 * UI Model for Expense
 * Used in client components and pages
 */
export interface ExpenseUI {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}


