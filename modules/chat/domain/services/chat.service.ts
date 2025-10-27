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
    const message = await this.messageRepository.createMessage(
      conversation.id,
      "user",
      initialMessage
    );

    return { conversation, message };
  }

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    return this.messageRepository.createMessage(conversationId, role, content);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.conversationRepository.deleteConversation(conversationId);
  }
}

