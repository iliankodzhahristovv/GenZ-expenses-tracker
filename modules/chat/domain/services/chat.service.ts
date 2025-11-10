import { injectable, inject } from "inversify";
import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import { CHAT_TYPES } from "../../chat.symbols";

/**
 * Chat Service
 * Handles business logic for chat operations
 */
@injectable()
export class ChatService {
  constructor(
    @inject(CHAT_TYPES.ConversationRepository)
    private conversationRepository: ConversationRepository,
    @inject(CHAT_TYPES.MessageRepository)
    private messageRepository: MessageRepository
  ) {}

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.getConversationsByUserId(userId);
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.getMessagesByConversationId(conversationId);
  }

  async createConversation(userId: string, initialMessage: string): Promise<{ conversation: Conversation; message: Message }> {
    // Generate a title from the first message (truncate if too long)
    const title = initialMessage.length > 50 
      ? initialMessage.substring(0, 50) + "..." 
      : initialMessage;

    const conversation = await this.conversationRepository.createConversation(userId, title);
    
    try {
      const message = await this.messageRepository.createMessage(
        conversation.id,
        "user",
        initialMessage
      );

      return { conversation, message };
    } catch (messageError) {
      // Rollback: Delete the conversation if message creation fails
      try {
        await this.conversationRepository.deleteConversation(conversation.id);
      } catch (deleteError) {
        // Log deletion failure but prioritize the original error
        console.error(
          `Failed to rollback conversation ${conversation.id} after message creation error:`,
          deleteError instanceof Error ? deleteError.message : String(deleteError)
        );
      }
      
      // Rethrow the original message creation error
      throw messageError;
    }
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    // Validate and normalize message content
    const trimmedContent = content?.trim();
    
    if (!trimmedContent) {
      throw new Error("Message content cannot be empty");
    }
    
    return this.messageRepository.createMessage(conversationId, role, trimmedContent);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.conversationRepository.deleteConversation(conversationId);
  }
}

