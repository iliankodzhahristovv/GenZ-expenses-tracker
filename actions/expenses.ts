"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiResponse, ApiResponseBuilder } from "@/types/common.types";
import { ExpenseUI } from "@/models/expense-ui.model";
import { ExpenseUIMapper } from "@/mappers/expense-ui.mapper";

/**
 * Zod schema for expense creation
 */
const CreateExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required"),
});

/**
 * Zod schema for expense update
 */
const UpdateExpenseSchema = z.object({
  id: z.string().uuid("Invalid expense ID"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required"),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseSchema>;

/**
 * Explicit columns to select from expenses table
 */
const EXPENSE_COLUMNS = "id, user_id, date, amount, description, category, created_at, updated_at";

/**
 * Get all expenses for the current user
 */
export async function getExpensesAction(): Promise<ApiResponse<ExpenseUI[]>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { data, error } = await supabase
      .from("expenses")
      .select(EXPENSE_COLUMNS)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    const expenses = ExpenseUIMapper.fromDatabaseArray(data || []);
    return ApiResponseBuilder.success(expenses);
  } catch (error) {
    console.error("Error in getExpensesAction:", error);
    return ApiResponseBuilder.failure("Failed to fetch expenses");
  }
}

/**
 * Create a new expense
 */
export async function createExpenseAction(input: CreateExpenseInput): Promise<ApiResponse<ExpenseUI>> {
  try {
    // Validate input
    const validationResult = CreateExpenseSchema.safeParse(input);
    if (!validationResult.success) {
      return ApiResponseBuilder.failure(
        validationResult.error.errors[0]?.message || "Invalid input"
      );
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        date: validatedData.date,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
      })
      .select(EXPENSE_COLUMNS)
      .single();

    if (error) {
      console.error("Error creating expense:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/expenses");
    const expense = ExpenseUIMapper.fromDatabase(data);
    return ApiResponseBuilder.success(expense);
  } catch (error) {
    console.error("Error in createExpenseAction:", error);
    return ApiResponseBuilder.failure("Failed to create expense");
  }
}

/**
 * Update an existing expense
 */
export async function updateExpenseAction(input: UpdateExpenseInput): Promise<ApiResponse<ExpenseUI>> {
  try {
    // Validate input
    const validationResult = UpdateExpenseSchema.safeParse(input);
    if (!validationResult.success) {
      return ApiResponseBuilder.failure(
        validationResult.error.errors[0]?.message || "Invalid input"
      );
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        date: validatedData.date,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
      })
      .eq("id", validatedData.id)
      .eq("user_id", user.id)
      .select(EXPENSE_COLUMNS)
      .single();

    if (error) {
      console.error("Error updating expense:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/expenses");
    const expense = ExpenseUIMapper.fromDatabase(data);
    return ApiResponseBuilder.success(expense);
  } catch (error) {
    console.error("Error in updateExpenseAction:", error);
    return ApiResponseBuilder.failure("Failed to update expense");
  }
}

/**
 * Delete an expense
 */
export async function deleteExpenseAction(expenseId: string): Promise<ApiResponse<void>> {
  try {
    // Validate expense ID
    const validationResult = z.string().uuid().safeParse(expenseId);
    if (!validationResult.success) {
      return ApiResponseBuilder.failure("Invalid expense ID");
    }

    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", expenseId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting expense:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/expenses");
    return ApiResponseBuilder.success(undefined as void);
  } catch (error) {
    console.error("Error in deleteExpenseAction:", error);
    return ApiResponseBuilder.failure("Failed to delete expense");
  }
}
