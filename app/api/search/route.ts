import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        include_answer: true,
        max_results: 3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Tavily error:", errText);
      return NextResponse.json({ error: "Search request failed" }, { status: 502 });
    }

    const data = await response.json();
    const answer = data?.answer ?? "I couldn't find a clear answer for that.";

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("Search route error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
