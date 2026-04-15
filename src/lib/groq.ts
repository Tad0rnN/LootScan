import Groq from "groq-sdk";
import type { AISearchResponse } from "@/types";

export async function parseNaturalLanguageSearch(
  userQuery: string
): Promise<AISearchResponse> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a game expert assistant for LootScan, a game deals site.

Classify the user query into one of two modes:

MODE "similar": User asks for games similar to another game, or by genre/style (e.g. "cyberpunk-like games", "open world RPGs like Witcher", "souls-like games").
→ Identify the genre/style and list up to 12 specific real base game titles that strongly match.
→ Do NOT include DLC, soundtracks, expansions, bundles, editions, or vague filler suggestions.
→ Set gameTitles to those 12 titles.
→ Set filters.sortBy to "Deal Rating".
→ Only set filters.onSale to true if the user explicitly asks for discounted / cheap / on-sale games.

MODE "deals": User asks about prices, discounts, free games, specific store, budget (e.g. "cheap RPGs under $10", "free games on Epic", "best Metacritic deals").
→ Set gameTitles to [].
→ Fill filters with: maxPrice, minMetacritic, storeID (1=Steam,7=GOG,11=Humble,27=Epic), sortBy, onSale.
→ Use filters.title only for a specific game name, not for broad genre/style queries.
→ Only set onSale=true when the user explicitly asks for discounts, deals, cheap games, or free games.

Always write interpretation in the SAME language as the user's query.
Respond ONLY with valid JSON, no markdown:
{
  "interpretation": "...",
  "searchMode": "similar" | "deals",
  "gameTitles": ["Title 1", ...],
  "filters": { "sortBy": "Deal Rating", "maxPrice": null, "minMetacritic": null, "storeID": null, "onSale": false }
}`,
      },
      {
        role: "user",
        content: userQuery,
      },
    ],
    temperature: 0.4,
    max_tokens: 500,
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
