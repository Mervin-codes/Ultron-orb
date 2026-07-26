import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
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
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
              text: "Identify the single main object in this image. Respond with ONLY the object's name, 1-3 words maximum, no extra explanation. For example: 'Bottle' or 'AirPods' or 'Coffee mug'.",
              },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq vision error:", errText);
      return NextResponse.json({ error: "Vision request failed" }, { status: 502 });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content ?? "I could not identify the object.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Vision route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
