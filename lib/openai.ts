import { openai } from "@ai-sdk/openai";

/**
 * OpenAI client configuration
 * Uses the OpenAI API key from environment variables
 */
export const getOpenAIModel = (model: string = "gpt-4o-mini") => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  
  return openai(model);
};


