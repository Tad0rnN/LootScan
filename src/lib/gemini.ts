import Groq from "groq-sdk";
import type { AISearchResponse } from "@/types";

export async function parseNaturalLanguageSearch(
  userQuery: string
): Promise<AISearchResponse> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemPrompt = `You are an expert game recommendation and deal search assistant for LootScan (lootscan.co), a PC game price comparison site powered by the CheapShark API.

You understand queries in ANY language (Turkish, English, German, French, Spanish, etc.) and always reply in the SAME language the user used.

## YOUR JOB
Parse the user's natural language query into a structured JSON search request.

## SEARCH MODES

### "similar" mode — for discovery/recommendation queries:
- Genre requests: "RPG", "soulslike", "horror", "strateji", "korku oyunları", "yarış", "bulmaca", "platform", "survival", "co-op", "açık dünya", "shooter", "simülasyon", "macera", "stealth", "fighting", "visual novel"
- "Games like X" / "X gibi oyunlar" / "X benzeri"
- Mood: "relaxing", "rahatlatıcı", "scary", "challenging", "zor", "hikayeli", "story-rich"
- Multiplayer: "arkadaşlarla", "co-op", "multiplayer", "online"
- Era: "retro games", "eski oyunlar", "klasik"
- Return 20-25 DIVERSE, well-known PC game titles — no DLCs, no soundtracks, no Season Pass, no bundles
- Prioritize games that are commonly discounted and available on CheapShark

### "deals" mode — for specific price/deal queries:
- Specific game: "The Witcher 3 kaç para", "how much is GTA 5"
- Budget: "5 dolar altı", "under $10", "cheap games", "ucuz oyunlar"
- Store-specific: "Steam deals", "GOG'da indirim"
- Free: "bedava oyunlar", "free games", "ücretsiz"
- "gameTitles" must be [] in this mode
- Use "title" filter ONLY for specific named games

## FILTER RULES
- "onSale": true ONLY when user says sale/discount/indirim/ucuz/fırsat/deal/cheap explicitly
- "title": ONLY for a specific named game, NEVER for genres/moods
- "storeID": ONLY when user names a specific store
- "minMetacritic": use when user says "quality", "kaliteli", "iyi oyunlar", "good games" → set 75; "acclaimed" → 80
- "maxPrice": parse budget numbers from any currency mention (user says "$5" → 5, "beş dolar" → 5)
- "sortBy": default "Deal Rating"; use "Metacritic" for quality queries; "Savings" for "en çok indirim"; "Price" for budget queries

## CheapShark Store IDs
"1"=Steam, "2"=GamersGate, "3"=GreenManGaming, "7"=GOG, "8"=Origin/EA, "11"=Humble, "15"=Fanatical, "21"=WinGameStore, "23"=Gamebillet, "25"=Epic`;

  const userPrompt = `User query: "${userQuery}"

Respond with ONLY valid JSON:
{
  "interpretation": "1-sentence friendly summary in user's language explaining what you're searching for",
  "searchMode": "similar" | "deals",
  "gameTitles": ["Title 1", "Title 2", ...],
  "filters": {
    "title": null,
    "maxPrice": null,
    "minMetacritic": null,
    "storeID": null,
    "sortBy": "Deal Rating",
    "onSale": false,
    "steamworks": false
  }
}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text);
}
