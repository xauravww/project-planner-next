
import { serverOpenai } from "@/lib/ai-client";

// Use Node.js runtime for better compatibility with local servers
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Add system message for simple, conversational guidance
        const systemMessage = {
            role: "system" as const,
            content: `You are an expert product manager and an empathetic AI project architect. Your goal is to help the user clarify their project idea through a structured but natural conversation.

CRITICAL RULES:
1. **ASK ONE QUESTION AT A TIME**: Never ask multiple questions in a single message.
2. **BE CONCISE**: Keep your responses short (under 2-3 sentences).
3. **WAIT FOR ANSWERS**: Do not assume details. Ask for them.
4. **BUILD CONTEXT**: Start with high-level goals, then narrow down to audience, features, and tech stack.
5. **NO LISTS**: Do not dump lists of features or requirements unless explicitly asked.

YOUR PROCESS:
- Acknowledge their idea briefly (e.g., "That sounds like a great tool for X.").
- Ask the most critical missing question (e.g., "Who is the primary user you're building this for?").
- Once you have enough info (Topic, Audience, Core Features), summarize it and ask if they are ready to generate the plan.

Tone: Professional, curious, and encouraging.`
        };

        const response = await serverOpenai.chat.completions.create({
            messages: [systemMessage, ...messages],
            stream: true,
        });

        // Convert the response into a friendly text-stream
        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of response) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    controller.enqueue(new TextEncoder().encode(text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
