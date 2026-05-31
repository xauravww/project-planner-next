import { NextRequest, NextResponse } from "next/server";
import { serverOpenai } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const { parentContent, parentType, siblingContents = [] } = await req.json();

    const messages = [
      {
        role: "system" as const,
        content: `You are a brainstorming assistant helping expand project ideas into structured thoughts.
Given a parent thought, generate 2-4 relevant child thoughts that would help flesh out a project plan.

Guidelines:
- Generate diverse, concrete, and specific ideas
- Match the appropriate thought type (user/feature/problem/solution)
- Keep each thought to one concise sentence
- Be creative but practical

Response format: Return ONLY a JSON array of strings. Example: ["Thought 1", "Thought 2", "Thought 3"]`
      },
      {
        role: "user" as const,
        content: `Parent thought (${parentType}): "${parentContent}"
${siblingContents.length > 0 ? `\nExisting related thoughts:\n${siblingContents.map((s: string) => `- ${s}`).join("\n")}` : ""}

Generate 2-4 child thoughts that expand on this. Consider:
- If parent is a "problem": suggest specific pain points or user frustrations
- If parent is a "feature": suggest implementation details or sub-features
- If parent is a "user": suggest specific user needs or behaviors
- If parent is a "solution": suggest alternative approaches or benefits

Return as JSON array of strings:`
      }
    ];

    const response: any = await serverOpenai.chat.completions.create({
      messages,
      stream: false,
    });

    const text = response.choices?.[0]?.message?.content || "";

    // Parse the response
    let suggestions: string[];
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by lines and clean up
        suggestions = text
          .split(/\n/)
          .map((line: string) => line.replace(/^[-*\d.\s"']+/, "").replace(/["',]+$/, "").trim())
          .filter((line: string) => line.length > 5 && line.length < 200);
      }
    } catch {
      // Ultimate fallback
      suggestions = text
        .split(/\n/)
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 5)
        .slice(0, 4);
    }

    // Ensure we have valid suggestions
    suggestions = suggestions
      .filter((s) => s && s.length > 3)
      .slice(0, 4)
      .map((s) => (s.endsWith(".") ? s : s + "."));

    if (suggestions.length === 0) {
      suggestions = [
        "Explore specific implementation details.",
        "Consider potential user feedback."
      ];
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Brainstorm API error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
