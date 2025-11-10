import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getOpenAIModel } from "@/lib/openai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Authentication check - validate user before processing request
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Log authentication failure without leaking sensitive information
      console.warn("Unauthorized chat API access attempt", {
        timestamp: new Date().toISOString(),
        hasAuthError: !!authError,
        // Do not log error details or user information
      });

      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in to access the chat." }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body only after authentication succeeds
    const { messages } = await req.json();

    // Get OpenAI model instance (includes API key validation)
    const model = getOpenAIModel("gpt-4o-mini");

    const result = await streamText({
      model,
      messages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Create a custom streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const textPart of result.textStream) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(textPart)}\n`));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}

