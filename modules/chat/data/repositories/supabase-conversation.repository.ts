import { injectable } from "inversify";
import { createClient } from "@/lib/supabase/server";
import { ConversationRepository } from "../../domain/repositories/conversation.repository";
import { Conversation } from "../../domain/models/conversation.model";

/**
 * Supabase implementation of ConversationRepository
 */
@injectable()
export class SupabaseConversationRepository implements ConversationRepository {
  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateConversationTitle(id: string, title: string): Promise<Conversation> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async deleteConversation(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }
}


