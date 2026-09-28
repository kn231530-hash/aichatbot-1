import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export async function POST(request: Request) {
  try {
    const { messages } = (await request.json()) as { messages?: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Please send a message." }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in your Vercel environment variables." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: groqKey });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are Orken AI, the official Orken AI chatbot. Your name is Orken AI. If a user asks who you are, what bot you are, or what AI you use, identify yourself as Orken AI. Do not introduce yourself as OpenAI, ChatGPT, AI Chatbot 1, or any other chatbot. If the user asks about Orken or Orken AI, explain that you are the Orken AI assistant and answer using only information actually available to you; do not invent company, product, ownership, features, or website facts. If the user asks about another company or AI such as OpenAI, answer the factual question normally, but do not change your identity. Be helpful, concise, accurate, and safe.",
        },
        ...messages.slice(-20),
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    });

    const answer =
      completion.choices[0]?.message?.content?.trim() ||
      "I couldn't generate a response.";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error: dbError } = await supabase.from("chat_messages").insert([
        { role: "user", content: messages[messages.length - 1].content },
        { role: "assistant", content: answer },
      ]);
      if (dbError) console.error("Supabase save error:", dbError);
    }

    return NextResponse.json({ message: answer });
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown Groq API error";
    return NextResponse.json({ error: `Groq request failed: ${message}` }, { status: 500 });
  }
}