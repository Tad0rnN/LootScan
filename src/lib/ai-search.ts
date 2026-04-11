import type { AISearchResponse } from "@/types";
import { parseNaturalLanguageSearch as parseWithGroq } from "@/lib/groq";
import { parseNaturalLanguageSearch as parseWithGemini } from "@/lib/gemini";

function normalizeResponse(response: AISearchResponse): AISearchResponse {
  return {
    interpretation: response.interpretation,
    searchMode: response.searchMode === "similar" ? "similar" : "deals",
    gameTitles: Array.isArray(response.gameTitles) ? response.gameTitles : [],
    filters: response.filters ?? {},
  };
}

export async function parseNaturalLanguageSearch(userQuery: string): Promise<AISearchResponse> {
  const errors: string[] = [];

  try {
    return normalizeResponse(await parseWithGroq(userQuery));
  } catch (error) {
    errors.push(error instanceof Error ? `Groq: ${error.message}` : "Groq: unknown error");
  }

  try {
    return normalizeResponse(await parseWithGemini(userQuery));
  } catch (error) {
    errors.push(error instanceof Error ? `Gemini: ${error.message}` : "Gemini: unknown error");
  }

  throw new Error(errors.join(" | "));
}
