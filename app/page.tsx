"use client";

import { FormEvent, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I’m AI Chatbot 1. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      setMessages([...nextMessages, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages([...nextMessages, {
        role: "assistant",
        content: error instanceof Error ? error.message : "Something went wrong.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="chat">
        <header className="header">
          <img className="logoImage" src="/logo.svg" alt="AI Chatbot logo" />
          <div><h1>AI Chatbot 1</h1><p>Powered by Groq</p></div>
          <span className="status">Online</span>
        </header>

        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={message.role === "user" ? "row user" : "row"}>
              <div className={message.role === "user" ? "bubble userBubble" : "bubble"}>
                {message.content}
              </div>
            </div>
          ))}
          {loading && <div className="row"><div className="bubble typing">Thinking…</div></div>}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message AI Chatbot 1..." aria-label="Message" />
          <button disabled={loading || !input.trim()}>{loading ? "..." : "Send"}</button>
        </form>
      </section>
    </main>
  );
}