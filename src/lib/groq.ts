import Groq from "groq-sdk";
import type { GeminiSearchResponse } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function parseNaturalLanguageSearch(
  userQuery: string
): Promise<GeminiSearchResponse> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a game deal search assistant for LootScan, which uses the CheapShark API.
Convert natural language queries into structured JSON search filters.

CheapShark filter options:
- title: string (game title keyword)
- maxPrice: number (max price in USD, 0 for free games)
- minMetacritic: number (min Metacritic score 0-100)
- storeID: string (1=Steam, 7=GOG, 11=Humble, 15=Fanatical, 27=Epic)
- sortBy: string (Deal Rating | Savings | Price | Metacritic | Reviews | recent | Title)
- onSale: boolean
- steamworks: boolean

Always respond ONLY with valid JSON, no markdown, no explanation:
{"interpretation":"...","query":"...","filters":{...}}`,
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
