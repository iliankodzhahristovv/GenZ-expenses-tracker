import { injectable } from "inversify";
import { createClient } from "@/lib/supabase/server";
import { MessageRepository } from "../../domain/repositories/message.repository";
import { Message } from "../../domain/models/message.model";

/**
 * Supabase implementation of MessageRepository
 */
@injectable()
export class SupabaseMessageRepository implements MessageRepository {
  async getMessagesByConversationId(conversationId: string): Promise<Message[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      role: row.role as "user" | "assistant",
      content: row.content,
      createdAt: new Date(row.created_at),
    }));
  }

  async createMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }

    // Keep conversation fresh for sorting
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role as "user" | "assistant",
      content: data.content,
      createdAt: new Date(data.created_at),
    };
  }

  async deleteMessagesByConversationId(conversationId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (error) {
      throw new Error(`Failed to delete messages: ${error.message}`);
    }
  }
}


