import prisma from "@/lib/prisma";

export interface AiConfig {
  activeProvider: "gemini" | "openai" | "anthropic" | "openrouter" | "grok" | "groq" | "ollama";
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  temperature?: number;
}

export interface GenerateOptions {
  prompt: string;
  action?: "GENERATE" | "POLISH" | "EXCERPT" | "PROVENANCE" | "DEVOTIONAL_TONE";
  context?: string;
  tone?: "DEVOTIONAL" | "SCHOLARLY" | "LUXURY" | "CONCISE";
  modelOverride?: string;
}

const CULTURAL_SYSTEM_PROMPT = `
You are the curatorial and artistic voice of the SavazAI Digital Atelier & Cultural Archive.
This platform archives and presents museum-grade fine art collections, traditional craftsmanship, archival masterworks, cultural documentation, and spatial exhibition walkthroughs.

Your writing should reflect:
1. Deep knowledge of classical fine art, material techniques, conservation practices, and masterwork provenance.
2. Profound understanding of cultural traditions, historical movements, and artistic lineages.
3. Curatorial elegance, scholarly precision, and cultural authenticity. Avoid generic AI jargon or hollow buzzwords.
`.trim();

export async function getAiConfig(): Promise<AiConfig> {
  let settings = null;
  try {
    settings = await prisma.systemSetting.findFirst();
  } catch {
    // Database initializing
  }

  const stored = (settings?.aiConfig as AiConfig | null) || null;

  return {
    activeProvider:
      stored?.activeProvider ||
      (process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : "gemini"),
    apiKey:
      stored?.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.GROQ_API_KEY ||
      "",
    baseUrl: stored?.baseUrl || "",
    defaultModel: stored?.defaultModel || "gemini-1.5-pro",
    temperature: stored?.temperature ?? 0.7,
  };
}

export async function generateAiContent(options: GenerateOptions): Promise<string> {
  const config = await getAiConfig();
  const { prompt, action = "GENERATE", context = "", tone = "SCHOLARLY" } = options;

  let taskInstruction = "";
  switch (action) {
    case "POLISH":
      taskInstruction = "Refine, enrich, and elevate the following text into polished cultural prose:";
      break;
    case "EXCERPT":
      taskInstruction = "Generate a compelling 2-sentence SEO and social summary excerpt for:";
      break;
    case "PROVENANCE":
      taskInstruction = "Curate an authoritative art description focusing on provenance, material techniques, and curatorial attributes for:";
      break;
    case "DEVOTIONAL_TONE":
      taskInstruction = "Infuse this description with cultural resonance and curatorial reverence:";
      break;
    default:
      taskInstruction = "Compose high-quality text for:";
      break;
  }

  const fullPrompt = `
${CULTURAL_SYSTEM_PROMPT}

Tone Preference: ${tone}
Task: ${taskInstruction}

User Request:
${prompt}

${context ? `Existing / Source Context:\n${context}` : ""}
`.trim();

  const provider = config.activeProvider;
  const apiKey = config.apiKey;

  if (!apiKey && provider !== "ollama") {
    throw new Error(
      `No API key configured for AI provider '${provider}'. Please add your API key in System Settings.`
    );
  }

  // 1. Google Gemini
  if (provider === "gemini") {
    const model = options.modelOverride || config.defaultModel || "gemini-1.5-pro";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini API error (${res.status})`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  }

  // 2. Anthropic Claude
  if (provider === "anthropic") {
    const model = options.modelOverride || config.defaultModel || "claude-3-5-sonnet-20241022";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        temperature: config.temperature,
        system: CULTURAL_SYSTEM_PROMPT,
        messages: [{ role: "user", content: `${taskInstruction}\n\n${prompt}\n\n${context}` }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic API error (${res.status})`);
    }

    const data = await res.json();
    return data.content?.[0]?.text?.trim() || "";
  }

  // 3. OpenAI, OpenRouter, xAI Grok, Groq, Ollama (OpenAI compatible endpoints)
  let endpoint = "https://api.openai.com/v1/chat/completions";
  let defaultModelName = "gpt-4o";

  if (provider === "openrouter") {
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    defaultModelName = "anthropic/claude-3.5-sonnet";
  } else if (provider === "grok") {
    endpoint = "https://api.x.ai/v1/chat/completions";
    defaultModelName = "grok-2-latest";
  } else if (provider === "groq") {
    endpoint = "https://api.groq.com/openai/v1/chat/completions";
    defaultModelName = "llama-3.3-70b-versatile";
  } else if (provider === "ollama") {
    endpoint = `${config.baseUrl ? config.baseUrl.replace(/\/+$/, "") : "http://localhost:11434"}/v1/chat/completions`;
    defaultModelName = "llama3";
  }

  const model = options.modelOverride || config.defaultModel || defaultModelName;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: CULTURAL_SYSTEM_PROMPT },
        { role: "user", content: `${taskInstruction}\n\n${prompt}\n\n${context}` },
      ],
      temperature: config.temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `${provider} API request failed (${res.status})`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}
