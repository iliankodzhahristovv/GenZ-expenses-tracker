import { Container } from "inversify";
import { ConversationRepository } from "./domain/repositories/conversation.repository";
import { MessageRepository } from "./domain/repositories/message.repository";
import { SupabaseConversationRepository } from "./data/repositories/supabase-conversation.repository";
import { SupabaseMessageRepository } from "./data/repositories/supabase-message.repository";
import { ChatService } from "./domain/services/chat.service";
import { CHAT_TYPES } from "./chat.symbols";

/**
 * Chat Module
 * Configures dependency injection for chat domain
 */
export class ChatModule {
  static register(container: Container): void {
    // Repositories
    container
      .bind<ConversationRepository>(CHAT_TYPES.ConversationRepository)
      .to(SupabaseConversationRepository);
    container
      .bind<MessageRepository>(CHAT_TYPES.MessageRepository)
      .to(SupabaseMessageRepository);

    // Services
    container.bind<ChatService>(CHAT_TYPES.ChatService).to(ChatService).inSingletonScope();
  }
}

