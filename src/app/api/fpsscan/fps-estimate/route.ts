import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { PCSpecs } from "@/types/fpsscan";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { specs, gameName, gameSlug } = body as {
    specs: PCSpecs;
    gameName: string;
    gameSlug: string;
  };

  if (!specs?.gpu || !gameName) {
    return NextResponse.json({ error: "Missing specs or game" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a PC gaming performance expert. Estimate the average FPS for the game "${gameName}" (slug: ${gameSlug}) with these PC specs:
- GPU: ${specs.gpu.name} (performance tier score: ${specs.gpu.score}/360, VRAM: ${specs.gpu.vram}GB)
- CPU: ${specs.cpu?.name ?? "Mid-range CPU (i5-12400 equivalent)"}
- RAM: ${specs.ram}GB
- Resolution options: 1080p, 1440p, 4K
- Quality preset options: Low, Medium, High, Ultra

Based on real-world benchmarks from Digital Foundry, TechPowerUp, and GamersNexus, provide realistic FPS estimates.

IMPORTANT: Return ONLY valid JSON with this exact structure (integers only, no decimals):
{
  "fps": {
    "1080p": { "low": X, "medium": X, "high": X, "ultra": X },
    "1440p": { "low": X, "medium": X, "high": X, "ultra": X },
    "4K": { "low": X, "medium": X, "high": X, "ultra": X }
  },
  "bottleneck": "gpu" | "cpu" | "ram" | "none",
  "notes": "one sentence about performance characteristics or notable issues (RT, VRAM, etc)"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 512,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[fps-estimate] error:", err);
    return NextResponse.json({ error: "Groq estimation failed", detail: String(err) }, { status: 500 });
  }
}
