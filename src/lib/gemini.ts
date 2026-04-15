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

  const prompt = `You are a game recommendation and deal search assistant for a site called LootScan that uses the CheapShark API.

Classify the user query into one of two modes:

MODE "similar":
- User asks for games similar to another game, by genre, by mood, or by style.
- Broad thematic requests like "+18 games", "simulation games", "story-rich games", "co-op games", "racing games" are also MODE "similar".
- Return up to 12 specific real base game titles in "gameTitles".
- Do not include DLC, soundtrack, expansion, bundle, season pass, or vague filler entries.
- Only set filters.onSale to true if the user explicitly asks for discounts / sales / cheap games.

MODE "deals":
- User asks for prices, discounts, free games, store-specific deals, or budget limits.
- Return "gameTitles": [].
- Use filters.title only when the query is clearly a specific game title.
- Do not use filters.title for broad genre/style recommendation queries.
- Only set filters.onSale to true when the user explicitly asks for deals / discounts / free / cheap games.

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
  "searchMode": "similar" | "deals",
  "gameTitles": ["Title 1"],
  "filters": {
    "title": "optional game title",
    "maxPrice": 0,
    "minMetacritic": 0,
    "storeID": "optional store id",
    "sortBy": "optional sort",
    "onSale": false,
    "steamworks": false
  }
}

Only include fields relevant to the query.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  const jsonStr = jsonMatch ? jsonMatch[1] : text;

  return JSON.parse(jsonStr.trim());
}
