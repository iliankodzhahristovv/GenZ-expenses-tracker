"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface IncomeData {
  id?: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export async function getIncomeAction() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("income")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    return { success: false, error: "Failed to fetch income" };
  }
}

export async function createIncomeAction(income: IncomeData) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("income")
      .insert({
        user_id: user.id,
        date: income.date,
        amount: income.amount,
        description: income.description,
        category: income.category,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/income");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to create income" };
  }
}

export async function updateIncomeAction(income: IncomeData) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    if (!income.id) {
      return { success: false, error: "Income ID is required" };
    }

    const { data, error} = await supabase
      .from("income")
      .update({
        date: income.date,
        amount: income.amount,
        description: income.description,
        category: income.category,
      })
      .eq("id", income.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/income");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Failed to update income" };
  }
}

export async function deleteIncomeAction(incomeId: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("income")
      .delete()
      .eq("id", incomeId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/income");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete income" };
  }
}

