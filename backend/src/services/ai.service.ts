import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export interface SummaryResult {
  summary: string;
  model: string;
}

export async function summarizeNotes(
  leadName: string,
  notes: Array<{ content: string; createdAt: Date }>
): Promise<SummaryResult> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY not set");
  if (notes.length === 0) throw new Error("No notes to summarize");

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const notesText = notes
    .map((n, i) => `[${i + 1}] ${new Date(n.createdAt).toLocaleDateString()}: ${n.content}`)
    .join("\n");

  const prompt = `You are a leads sales manager. Summarize the following notes for lead "${leadName}" in 50-100 words.focus on main interactions, next steps, and overall engagement. Be factual and concise.\n\nNotes:\n${notesText}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error("Empty response from Gemini");
    return { summary: text.trim(), model: MODEL };
  } catch (err) {
    const wrapped = new Error(`summarize failed: ${err instanceof Error ? err.message : "unknown error"}`);
    wrapped.cause = err;
    throw wrapped;
  }
}
