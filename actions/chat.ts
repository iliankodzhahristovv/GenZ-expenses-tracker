"use server";

import { container } from "@/lib/container-config";
import { ChatService } from "@/modules/chat/domain/services/chat.service";
import { CHAT_TYPES } from "@/modules/chat/chat.symbols";
import { getCurrentUserAction } from "./auth";
import { ApiResponseBuilder, type ApiResponse } from "@/types/common.types";
import type { 
  ConversationDTO, 
  MessageDTO, 
  CreateConversationResponseDTO,
  Conversation,
  Message,
  CreateConversationResponse,
} from "@/types/chat.types";
import { 
  conversationToDTO, 
  messageToDTO, 
  createConversationResponseToDTO 
} from "@/types/chat.types";

/**
 * Get all conversations for the current user
 * @returns ApiResponse containing array of ConversationDTO
 */
export async function getUserConversationsAction(): Promise<ApiResponse<ConversationDTO[]>> {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const conversations = await chatService.getUserConversations(userResponse.data.id);

    // Convert domain models to DTOs for serialization
    const conversationDTOs = (conversations as Conversation[]).map(conversationToDTO);
    return ApiResponseBuilder.success<ConversationDTO[]>(conversationDTOs);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to fetch conversations"
    );
  }
}

/**
 * Get messages for a specific conversation
 * @param conversationId - The conversation ID
 * @returns ApiResponse containing array of MessageDTO
 */
export async function getConversationMessagesAction(conversationId: string): Promise<ApiResponse<MessageDTO[]>> {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const messages = await chatService.getConversationMessages(conversationId);

    // Convert domain models to DTOs for serialization
    const messageDTOs = (messages as Message[]).map(messageToDTO);
    return ApiResponseBuilder.success<MessageDTO[]>(messageDTOs);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to fetch messages"
    );
  }
}

/**
 * Create a new conversation with an initial message
 * @param initialMessage - The first message in the conversation
 * @returns ApiResponse containing CreateConversationResponseDTO
 */
export async function createConversationAction(initialMessage: string): Promise<ApiResponse<CreateConversationResponseDTO>> {
  try {
    // Validate initial message before any other operations
    const trimmedMessage = initialMessage?.trim();
    if (!trimmedMessage) {
      return ApiResponseBuilder.failure("Initial message cannot be empty");
    }

    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const result = await chatService.createConversation(
      userResponse.data.id,
      trimmedMessage
    );

    // Convert domain model to DTO for serialization
    const responseDTO = createConversationResponseToDTO(result as CreateConversationResponse);
    return ApiResponseBuilder.success<CreateConversationResponseDTO>(responseDTO);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to create conversation"
    );
  }
}

/**
 * Add a message to an existing conversation
 * @param conversationId - The conversation ID
 * @param role - The message role ("user" or "assistant")
 * @param content - The message content
 * @returns ApiResponse containing MessageDTO
 */
export async function addMessageAction(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): Promise<ApiResponse<MessageDTO>> {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const message = await chatService.addMessage(conversationId, role, content);

    // Convert domain model to DTO for serialization
    const messageDTO = messageToDTO(message as Message);
    return ApiResponseBuilder.success<MessageDTO>(messageDTO);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to add message"
    );
  }
}

/**
 * Delete a conversation
 * @param conversationId - The conversation ID to delete
 * @returns ApiResponse with null data on success
 */
export async function deleteConversationAction(conversationId: string): Promise<ApiResponse<null>> {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    await chatService.deleteConversation(conversationId);

    return ApiResponseBuilder.success<null>(null);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to delete conversation"
    );
  }
}
