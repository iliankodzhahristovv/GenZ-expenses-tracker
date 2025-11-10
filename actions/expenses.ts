"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ExpenseData {
  id?: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

/**
 * Validates expense data before database operations
 * Returns { valid: true } or { valid: false, error: string }
 */
function validateExpenseData(expense: ExpenseData, requireId: boolean = false): { valid: boolean; error?: string } {
  // Validate ID if required (for updates)
  if (requireId) {
    if (!expense.id || typeof expense.id !== 'string' || expense.id.trim().length === 0) {
      return { valid: false, error: "Valid expense ID is required" };
    }
  }

  // Validate date - must be a valid ISO date string
  if (!expense.date || typeof expense.date !== 'string') {
    return { valid: false, error: "Date is required and must be a string" };
  }
  
  const parsedDate = new Date(expense.date);
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, error: "Date must be a valid date format" };
  }

  // Validate amount - must be a finite positive number
  const amount = Number(expense.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, error: "Amount must be a positive number greater than zero" };
  }

  // Validate description - must be a non-empty string
  if (!expense.description || typeof expense.description !== 'string' || expense.description.trim().length === 0) {
    return { valid: false, error: "Description is required and cannot be empty" };
  }

  // Validate category - must be a non-empty string
  if (!expense.category || typeof expense.category !== 'string' || expense.category.trim().length === 0) {
    return { valid: false, error: "Category is required and cannot be empty" };
  }

  return { valid: true };
}

/**
 * Sanitizes and formats expense data for safe database insertion
 */
function sanitizeExpenseData(expense: ExpenseData): {
  date: string;
  amount: number;
  description: string;
  category: string;
} {
  return {
    date: new Date(expense.date).toISOString().split('T')[0], // Ensure YYYY-MM-DD format
    amount: Number(expense.amount),
    description: expense.description.trim(),
    category: expense.category.trim(),
  };
}

export async function getExpensesAction() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: "Failed to fetch expenses" };
  }
}

export async function createExpenseAction(expense: ExpenseData) {
  try {
    // Validate input data
    const validation = validateExpenseData(expense, false);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Invalid expense data" };
    }

    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Sanitize and format data
    const sanitizedData = sanitizeExpenseData(expense);

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        date: sanitizedData.date,
        amount: sanitizedData.amount,
        description: sanitizedData.description,
        category: sanitizedData.category,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to create expense" };
  }
}

export async function updateExpenseAction(expense: ExpenseData) {
  try {
    // Validate input data (requireId = true for updates)
    const validation = validateExpenseData(expense, true);
    if (!validation.valid) {
      return { success: false, error: validation.error || "Invalid expense data" };
    }

    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Sanitize and format data
    const sanitizedData = sanitizeExpenseData(expense);

    const { data, error } = await supabase
      .from("expenses")
      .update({
        date: sanitizedData.date,
        amount: sanitizedData.amount,
        description: sanitizedData.description,
        category: sanitizedData.category,
      })
      .eq("id", expense.id!)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to update expense" };
  }
}

export async function deleteExpenseAction(expenseId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete expense" };
  }
}

