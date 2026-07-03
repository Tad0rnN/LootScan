import type { AISearchResponse } from "@/types";

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
// deepseek-ai/deepseek-v4-flash and meta/llama-4-maverick's free endpoints hang indefinitely
// (verified — 25-30s with zero response, even streaming). nemotron-3-nano-30b-a3b is fast and
// reliable but its recommendations drift off-topic for nuanced multi-constraint queries
// (e.g. mixed in Rust/Fortnite/Apex Legends for a "calm relaxing farming games" query).
// nemotron-3-super-120b-a12b (4x the active params) is still fast (~2s) and reliable, and its
// recommendations were consistently on-topic across test queries.
const NVIDIA_MODEL = "nvidia/nemotron-3-super-120b-a12b";

export async function parseNaturalLanguageSearch(
  userQuery: string
): Promise<AISearchResponse> {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

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
- IMPORTANT: Always spell titles in the EXACT canonical form used on Steam/CheapShark (e.g. "Civilization VI" not "Civilization 6", "Baldur's Gate 3" not "Baldur's Gate III", "DOOM Eternal" not "Doom: Eternal") — the search that follows does exact/fuzzy string matching against store listings, so an off-canonical title silently drops the result.

### "deals" mode — for specific price/deal queries:
- Specific game: "The Witcher 3 kaç para", "how much is GTA 5"
- Budget: "5 dolar altı", "under $10", "cheap games", "ucuz oyunlar"
- Store-specific: "Steam deals", "GOG'da indirim"
- Free: "bedava oyunlar", "free games", "ücretsiz"
- "gameTitles" must be [] in this mode
- Use "title" filter ONLY for specific named games, spelled in canonical store form (see rule above)

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

  // The free NVIDIA endpoint occasionally queues under shared load (observed up to 30s+).
  // Bail out after 8s so the caller's heuristic fallback kicks in instead of hanging the request.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        // Disable the model's default chain-of-thought preamble — it eats the token
        // budget and this task only needs a direct JSON answer, not reasoning traces.
        chat_template_kwargs: { thinking: false },
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`NVIDIA API error: ${res.status} ${await res.text()}`);
  }

  const completion = await res.json();
  const text: string = completion.choices?.[0]?.message?.content ?? "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : text);
}
