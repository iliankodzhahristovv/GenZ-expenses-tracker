"use client";

import { useState, useRef, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import {
  getUserConversationsAction,
  getConversationMessagesAction,
  createConversationAction,
  addMessageAction,
  deleteConversationAction,
} from "@/actions/chat";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: Date;
}

/**
 * Chat Page
 * 
 * Protected page - requires authentication
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await getUserConversationsAction();
      if (response.success && response.data) {
        setConversations(
          response.data.map((conv: any) => ({
            id: conv.id,
            title: conv.title,
            updatedAt: new Date(conv.updatedAt),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      let conversationId = currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        const createResponse = await createConversationAction(userMessageContent);
        if (!createResponse.success || !createResponse.data) {
          throw new Error("Failed to create conversation");
        }
        
        conversationId = createResponse.data.conversation.id;
        setCurrentConversationId(conversationId);

        // Add the new conversation to the list
        setConversations((prev) => [
          {
            id: createResponse.data.conversation.id,
            title: createResponse.data.conversation.title,
            updatedAt: new Date(createResponse.data.conversation.updatedAt),
          },
          ...prev,
        ]);

        // Add user message to state
        setMessages([
          {
            id: createResponse.data.message.id,
            content: createResponse.data.message.content,
            role: "user",
          },
        ]);
      } else {
        // Add message to existing conversation
        const messageResponse = await addMessageAction(
          conversationId,
          "user",
          userMessageContent
        );
        
        if (!messageResponse.success || !messageResponse.data) {
          throw new Error("Failed to add message");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: messageResponse.data.id,
            content: messageResponse.data.content,
            role: "user",
          },
        ]);
      }

      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessageContent }].map(
            (msg) => ({
              role: msg.role,
              content: msg.content,
            })
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      const assistantId = crypto.randomUUID();
      let assistantContent = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantId, content: "", role: "assistant" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const text = line.slice(2).replace(/^"|"$/g, "");
            assistantContent += text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantId ? { ...msg, content: assistantContent } : msg
              )
            );
          }
        }
      }

      // Save assistant message to database
      if (conversationId && assistantContent) {
        const assistantMessageResponse = await addMessageAction(
          conversationId,
          "assistant",
          assistantContent
        );

        if (assistantMessageResponse.success && assistantMessageResponse.data) {
          // Update the message with the actual database ID
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, id: assistantMessageResponse.data.id }
                : msg
            )
          );
        }
      }

      // Reload conversations to update timestamps
      await loadConversations();
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setMessages((prev) => prev.filter((msg) => msg.role !== "assistant" || msg.content));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setMessages([]);
    
    try {
      const response = await getConversationMessagesAction(conversationId);
      if (response.success && response.data) {
        setMessages(
          response.data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Failed to load conversation");
    }
  };

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete
    
    try {
      const response = await deleteConversationAction(conversationId);
      if (response.success) {
        // Remove from conversations list
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
        
        // If we're viewing this conversation, clear it
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
        }
        
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes < 1) return 'Just now';
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ProtectedLayout>
      <Toaster />
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Chat Threads */}
        <div className="w-72 border-r border-gray-100 flex flex-col bg-white">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Chats</h2>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg h-8 px-3"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group relative w-full border-b border-gray-100 ${
                    currentConversationId === conversation.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => handleSelectConversation(conversation.id)}
                    className="w-full text-left px-4 py-3 pr-12 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(conversation.updatedAt)}
                    </p>
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Delete conversation"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="max-w-3xl mx-auto px-4 py-8">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    What do you want to know about your finances?
                  </h1>
                  <p className="text-sm text-gray-500 mb-8">Ask anything...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === "user"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    rows={1}
                    className="flex-1 rounded-2xl border-gray-200 focus:border-gray-300 focus:ring-0 min-h-[40px] max-h-[200px] resize-none overflow-y-auto py-2.5"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                    title="Send message"
                    className="rounded-full bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed h-10 w-10 p-0 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

