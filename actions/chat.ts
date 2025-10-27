"use server";

import { container } from "@/lib/container-config";
import { ChatService } from "@/modules/chat/domain/services/chat.service";
import { CHAT_TYPES } from "@/modules/chat/chat.symbols";
import { getCurrentUserAction } from "./auth";
import { ApiResponseBuilder } from "@/types/common.types";

/**
 * Get all conversations for the current user
 */
export async function getUserConversationsAction() {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const conversations = await chatService.getUserConversations(userResponse.data.id);

    return ApiResponseBuilder.success(conversations);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to fetch conversations"
    );
  }
}

/**
 * Get messages for a specific conversation
 */
export async function getConversationMessagesAction(conversationId: string) {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const messages = await chatService.getConversationMessages(conversationId);

    return ApiResponseBuilder.success(messages);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to fetch messages"
    );
  }
}

/**
 * Create a new conversation with an initial message
 */
export async function createConversationAction(initialMessage: string) {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const result = await chatService.createConversation(
      userResponse.data.id,
      initialMessage
    );

    return ApiResponseBuilder.success(result);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to create conversation"
    );
  }
}

/**
 * Add a message to an existing conversation
 */
export async function addMessageAction(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    const message = await chatService.addMessage(conversationId, role, content);

    return ApiResponseBuilder.success(message);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to add message"
    );
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversationAction(conversationId: string) {
  try {
    const userResponse = await getCurrentUserAction();

    if (!userResponse.success || !userResponse.data) {
      return ApiResponseBuilder.failure("User not authenticated");
    }

    const chatService = container.get<ChatService>(CHAT_TYPES.ChatService);
    await chatService.deleteConversation(conversationId);

    return ApiResponseBuilder.success(null);
  } catch (error) {
    return ApiResponseBuilder.failure(
      error instanceof Error ? error.message : "Failed to delete conversation"
    );
  }
}
