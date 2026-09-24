const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_BASE_URL = process.env.GEMINI_API_BASE_URL;
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL;
// const GENERATION_MODEL = "gemini-2.5-flash";
const GENERATION_MODEL = process.env.GEMINI_GENERATION_MODEL;
const HTTP_TIMEOUT_MS = Number(process.env.GEMINI_HTTP_TIMEOUT_MS || 15000);
export const GEMINI_EMBEDDING_DIMS = 3072;

export const embedText = async ({
  apiKey = API_KEY,
  text,
  baseUrl = DEFAULT_BASE_URL,
  model = EMBEDDING_MODEL,
  timeoutMs = HTTP_TIMEOUT_MS,
} = {}) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) {
    const err = new Error("embedText requires non-empty text");
    err.name = "ValidationError";
    err.status = 400;
    throw err;
  }
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY must be set to compute embeddings");
    err.name = "ConfigurationError";
    err.status = 500;
    throw err;
  }
  // Note: Google’s Generative Language API has multiple versions.
  // This client targets the common embedContent pattern and parses a couple of known response shapes.
  const url = `${baseUrl}/v1beta/models/${encodeURIComponent(
    model,
  )}:embedContent?key=${encodeURIComponent(apiKey)}`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { parts: [{ text: trimmed }] } }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    // A timeout or a transport failure rejects the await outright, so the
    // res.ok check below never sees it. Classify it here, or the caller gets
    // a bare 500 reading "fetch failed" with no mention of Gemini.
    const isTimeout =
      cause?.name === "TimeoutError" || cause?.name === "AbortError";
    const err = new Error(
      isTimeout
        ? `Gemini embedContent did not respond within ${timeoutMs}ms. Raise GEMINI_HTTP_TIMEOUT_MS or retry.`
        : `Gemini embedContent could not be reached: ${cause?.message || "network error"}`,
    );
    err.name = isTimeout ? "UpstreamTimeoutError" : "UpstreamError";
    err.status = isTimeout ? 504 : 502;
    err.cause = cause;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`Gemini embedContent HTTP ${res.status}`);
    err.name = "UpstreamError";
    err.status = 502;
    throw err;
  }
  const data = await res.json();

  const vector = data?.embedding?.values;

  if (!Array.isArray(vector)) {
    const err = new Error("Unexpected Gemini embeddings response shape");
    err.name = "UpstreamError";
    err.status = 502;
    err.details = { receivedKeys: data ? Object.keys(data) : null };
    throw err;
  }

  if (vector.length !== GEMINI_EMBEDDING_DIMS) {
    const err = new Error(
      `Embedding dimension mismatch: expected ${GEMINI_EMBEDDING_DIMS}, got ${vector.length}`,
    );
    err.name = "UpstreamError";
    err.status = 502;
    throw err;
  }

  return vector;
};

export const generateText = async ({
  apiKey = API_KEY,
  prompt,
  baseUrl = DEFAULT_BASE_URL,
  model = GENERATION_MODEL,
  timeoutMs = HTTP_TIMEOUT_MS,
  temperature = Number(process.env.GEMINI_TEMPERATURE || 0.2),
} = {}) => {
  const trimmed = String(prompt || "").trim();
  if (!trimmed) {
    const err = new Error("generateText requires non-empty prompt");
    err.name = "ValidationError";
    err.status = 400;
    throw err;
  }
  if (!apiKey) {
    const err = new Error("GEMINI_API_KEY must be set to generate text");
    err.name = "ConfigurationError";
    err.status = 500;
    throw err;
  }

  const url = `${baseUrl}/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: trimmed }] }],
      generationConfig: { temperature },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    const err = new Error(`Gemini generateContent HTTP ${res.status}`);
    err.name = "UpstreamError";
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  console.log(data);
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .map((p) => p?.text)
        .filter(Boolean)
        .join("")
    : null;

  if (!text) {
    const err = new Error("Unexpected Gemini generateContent response shape");
    err.name = "UpstreamError";
    err.status = 502;
    err.details = { receivedKeys: data ? Object.keys(data) : null };
    throw err;
  }

  return String(text).trim();
};
