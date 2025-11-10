import { createOpenAI } from "@ai-sdk/openai";

/**
 * OpenAI client configuration
 * Uses the OpenAI API key from environment variables
 * Creates an OpenAI provider instance with the specified model
 */
export const getOpenAIModel = (model: string = "gpt-4o-mini") => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  
  // Create OpenAI provider instance with API key
  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  return openai(model);
};


