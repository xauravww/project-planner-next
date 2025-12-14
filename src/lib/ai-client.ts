import "dotenv/config";
import OpenAI from "openai";

const baseURL = (process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:3010") + "/v1";
const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || "sk-myproxyserverkey23";

let _openai: OpenAI | null = null;

export const getOpenaiClient = () => {
    if (!_openai) {
        _openai = new OpenAI({
            baseURL,
            apiKey,
            dangerouslyAllowBrowser: true, // Allow client-side calls
        });
    }
    return _openai;
};

export const openai = getOpenaiClient();

// Server-side client (doesn't need dangerouslyAllowBrowser)
export const serverOpenai = new OpenAI({
    baseURL,
    apiKey,
});

export async function testAPIConnection() {
    try {
        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [{ role: "user", content: "Hello, this is a test." }],
            max_tokens: 50,
        });

        return {
            success: true,
            message: response.choices[0]?.message?.content || "No response",
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}

export async function streamChatCompletion(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>) {
    const stream = await serverOpenai.chat.completions.create({
        model: "grok-code",
        messages,
        stream: true,
    });

    return stream;
}
