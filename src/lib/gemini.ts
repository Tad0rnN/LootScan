import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AISearchResponse } from "@/types";

export async function parseNaturalLanguageSearch(
  userQuery: string
): Promise<AISearchResponse> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are a game deal search assistant for a site called LootScan that uses the CheapShark API.

Convert this natural language query into structured search filters.

User query: "${userQuery}"

CheapShark API filter options:
- title: string (game title keyword)
- maxPrice: number (maximum price in USD, 0 for free games)
- minMetacritic: number (minimum Metacritic score, 0-100)
- storeID: string (1=Steam, 2=GamersGate, 3=GreenManGaming, 7=GOG, 8=Origin, 11=Humble, 13=IGS, 15=Fanatical, 21=WinGameStore, 23=GreenManGaming, 25=Voidu, 27=Epic)
- sortBy: string (one of: Deal Rating, Title, Savings, Price, Metacritic, Reviews, Release, Store, recent)
- onSale: boolean (only show games currently on sale)
- steamworks: boolean (only show steamworks games)

Respond ONLY with valid JSON in this exact format:
{
  "interpretation": "A friendly 1-sentence summary of what the user is looking for",
  "query": "cleaned up search query for display",
  "filters": {
    "title": "optional game title",
    "maxPrice": 0,
    "minMetacritic": 0,
    "storeID": "optional store id",
    "sortBy": "optional sort",
    "onSale": true,
    "steamworks": false
  }
}

Only include filter fields that are relevant to the query. Always include "onSale": true unless user specifically asks for all games.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  return JSON.parse(jsonStr.trim());
}
