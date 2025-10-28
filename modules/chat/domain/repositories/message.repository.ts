import { Message } from "../models/message.model";

/**
 * Message Repository Interface
 */
export abstract class MessageRepository {
  abstract getMessagesByConversationId(conversationId: string): Promise<Message[]>;
  abstract createMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message>;
  abstract deleteMessagesByConversationId(conversationId: string): Promise<void>;
}


