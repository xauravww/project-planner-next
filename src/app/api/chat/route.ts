
import { serverOpenai } from "@/lib/ai-client";

// Use Node.js runtime for better compatibility with local servers
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages,
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
