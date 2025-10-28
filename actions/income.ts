"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ApiResponse, ApiResponseBuilder } from "@/types/common.types";
import { IncomeUI } from "@/models/income-ui.model";
import { IncomeUIMapper } from "@/mappers/income-ui.mapper";

/**
 * Zod schema for income creation
 */
const CreateIncomeSchema = z.object({
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required"),
});

/**
 * Zod schema for income update
 */
const UpdateIncomeSchema = z.object({
  id: z.string().uuid("Invalid income ID"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required"),
});

export type CreateIncomeInput = z.infer<typeof CreateIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof UpdateIncomeSchema>;

/**
 * Explicit columns to select from income table
 */
const INCOME_COLUMNS = "id, user_id, date, amount, description, category, created_at, updated_at";

/**
 * Get all income for the current user
 */
export async function getIncomeAction(): Promise<ApiResponse<IncomeUI[]>> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { data, error } = await supabase
      .from("income")
      .select(INCOME_COLUMNS)
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching income:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    const income = IncomeUIMapper.fromDatabaseArray(data || []);
    return ApiResponseBuilder.success(income);
  } catch (error) {
    console.error("Error in getIncomeAction:", error);
    return ApiResponseBuilder.failure("Failed to fetch income");
  }
}

/**
 * Create a new income
 */
export async function createIncomeAction(input: CreateIncomeInput): Promise<ApiResponse<IncomeUI>> {
  try {
    // Validate input
    const validationResult = CreateIncomeSchema.safeParse(input);
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
      .from("income")
      .insert({
        user_id: user.id,
        date: validatedData.date,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
      })
      .select(INCOME_COLUMNS)
      .single();

    if (error) {
      console.error("Error creating income:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/income");
    const income = IncomeUIMapper.fromDatabase(data);
    return ApiResponseBuilder.success(income);
  } catch (error) {
    console.error("Error in createIncomeAction:", error);
    return ApiResponseBuilder.failure("Failed to create income");
  }
}

/**
 * Update an existing income
 */
export async function updateIncomeAction(input: UpdateIncomeInput): Promise<ApiResponse<IncomeUI>> {
  try {
    // Validate input
    const validationResult = UpdateIncomeSchema.safeParse(input);
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
      .from("income")
      .update({
        date: validatedData.date,
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
      })
      .eq("id", validatedData.id)
      .eq("user_id", user.id)
      .select(INCOME_COLUMNS)
      .single();

    if (error) {
      console.error("Error updating income:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/income");
    const income = IncomeUIMapper.fromDatabase(data);
    return ApiResponseBuilder.success(income);
  } catch (error) {
    console.error("Error in updateIncomeAction:", error);
    return ApiResponseBuilder.failure("Failed to update income");
  }
}

/**
 * Delete an income
 */
export async function deleteIncomeAction(incomeId: string): Promise<ApiResponse<void>> {
  try {
    // Validate income ID
    const validationResult = z.string().uuid().safeParse(incomeId);
    if (!validationResult.success) {
      return ApiResponseBuilder.failure("Invalid income ID");
    }

    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const { error } = await supabase
      .from("income")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting income:", error);
      return ApiResponseBuilder.failure(error.message);
    }

    revalidatePath("/income");
    return ApiResponseBuilder.success(undefined as void);
  } catch (error) {
    console.error("Error in deleteIncomeAction:", error);
    return ApiResponseBuilder.failure("Failed to delete income");
  }
}
