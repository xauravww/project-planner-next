
import { serverOpenai } from "@/lib/ai-client";

// Use Node.js runtime for better compatibility with local servers
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Add system message for simple, conversational guidance
        const systemMessage = {
            role: "system" as const,
            content: `You are a friendly AI project planning assistant helping users brainstorm their project ideas.

KEEP IT SIMPLE AND CONVERSATIONAL:
- Have a natural, friendly conversation to understand their project idea
- Ask clarifying questions about what they want to build
- Discuss target audience, main features, and goals
- Keep responses concise and easy to read
- Use simple bullet points and short paragraphs

DO NOT:
- Create diagrams, flowcharts, or architecture sketches
- Write detailed technical specifications
- Generate code or implementation details
- Go into deep technical planning

Remember: This is just the initial brainstorming chat. Detailed planning, diagrams, and technical specs will be created later in dedicated project modules.`
        };

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
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
