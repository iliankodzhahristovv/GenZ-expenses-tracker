import { Conversation } from "../models/conversation.model";

/**
 * Conversation Repository Interface
 */
export abstract class ConversationRepository {
  abstract getConversationsByUserId(userId: string): Promise<Conversation[]>;
  abstract getConversationById(id: string): Promise<Conversation | null>;
  abstract createConversation(userId: string, title: string): Promise<Conversation>;
  abstract updateConversationTitle(id: string, title: string): Promise<Conversation>;
  abstract deleteConversation(id: string): Promise<void>;
}


