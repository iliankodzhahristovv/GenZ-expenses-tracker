/**
 * Chat-related DTO types
 * These represent the serialized data returned from server actions
 * Date objects are serialized as ISO strings when crossing the server/client boundary
 */

/**
 * Conversation DTO - data transfer object for conversations
 */
export interface ConversationDTO {
  id: string;
  userId: string;
  title: string;
  createdAt: string; // ISO date string from server serialization
  updatedAt: string; // ISO date string from server serialization
}

/**
 * Message DTO - data transfer object for messages
 */
export interface MessageDTO {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string; // ISO date string from server serialization
}

/**
 * Create conversation response DTO
 * Returned when creating a new conversation with initial message
 */
export interface CreateConversationResponseDTO {
  conversation: ConversationDTO;
  message: MessageDTO;
}

/**
 * Domain model types (from server, with Date objects)
 */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface CreateConversationResponse {
  conversation: Conversation;
  message: Message;
}

/**
 * Mapper functions to convert domain models to DTOs
 */
export function conversationToDTO(conversation: Conversation): ConversationDTO {
  return {
    id: conversation.id,
    userId: conversation.userId,
    title: conversation.title,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export function messageToDTO(message: Message): MessageDTO {
  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export function createConversationResponseToDTO(
  response: CreateConversationResponse
): CreateConversationResponseDTO {
  return {
    conversation: conversationToDTO(response.conversation),
    message: messageToDTO(response.message),
  };
}

