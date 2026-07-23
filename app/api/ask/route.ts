import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are Ultron, a calm and slightly dramatic AI assistant. Answer concisely, in 2-3 sentences suitable for being spoken aloud.",
          },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq error:", errText);
      return NextResponse.json({ error: "AI request failed" }, { status: 502 });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content ?? "I could not generate a response.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
