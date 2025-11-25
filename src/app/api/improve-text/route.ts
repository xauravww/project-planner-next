import { serverOpenai } from "@/lib/ai-client";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { text, fieldType } = await req.json();

        if (!text || !fieldType) {
            return new Response(
                JSON.stringify({ error: "Missing text or fieldType" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a professional editor. Improve the following ${fieldType} by:
- Fixing grammar and spelling
- Making it more clear and concise
- Adding relevant details where appropriate
- Maintaining the original intent and meaning
- Keeping it professional and well-structured

Return ONLY the improved text, nothing else.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const improvedText = response.choices[0]?.message?.content || text;

        return new Response(
            JSON.stringify({ improvedText }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Improve text API error:", error);
        return new Response(
            JSON.stringify({ error: error.message || "Failed to improve text" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
