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
    if (!groqKey) return NextResponse.json({ error: "GROQ_API_KEY is not configured." }, { status: 500 });

    const groq = new Groq({ apiKey: groqKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are AI Chatbot 1, a helpful, concise assistant. Answer clearly and safely." },
        ...messages.slice(-20),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || "I couldn't generate a response.";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("chat_messages").insert([
        { role: "user", content: messages[messages.length - 1].content },
        { role: "assistant", content: answer },
      ]);
    }

    return NextResponse.json({ message: answer });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "The model is temporarily unavailable. Please try again." }, { status: 500 });
  }
}