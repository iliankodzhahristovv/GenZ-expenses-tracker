/**
 * UI Model for Income
 * Used in client components and pages
 */
export interface IncomeUI {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}


