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
      .order("date", { ascending: false });

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
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
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
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    if (!expense.id) {
      return { success: false, error: "Expense ID is required" };
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        date: expense.date,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
      })
      .eq("id", expense.id)
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

