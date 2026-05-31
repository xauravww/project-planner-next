import "dotenv/config";

const baseURL = (process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:3010") + "/v1";
const token = process.env.NEXT_PUBLIC_AI_TOKEN || process.env.NEXT_PUBLIC_AI_API_KEY || "";

// Custom fetch client to replace OpenAI SDK
export const serverOpenai = {
    chat: {
        completions: {
            create: async ({ messages, stream }: { messages: any[], stream?: boolean, model?: string, max_tokens?: number }) => {
                const url = `${baseURL}/chat/completions`;
                const headers: Record<string, string> = {
                    "Content-Type": "application/json",
                };
                if (token) {
                    headers["Authorization"] = `Bearer ${token}`;
                }

                // Remove 'model' property as requested by user - server handles it
                const body = JSON.stringify({
                    messages,
                    stream: !!stream
                });

                if (stream) {
                    const response = await fetch(url, {
                        method: "POST",
                        headers,
                        body,
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`AI Server Error: ${response.status} ${errorText}`);
                    }

                    if (!response.body) throw new Error("No response body for stream");

                    // Return an async iterable compatible with how the previous code used invalid `serverOpenai` stream
                    // We need to mimic the structure: for await (const chunk of response) { chunk.choices[0].delta.content }

                    return (async function* () {
                        const reader = response.body!.getReader();
                        const decoder = new TextDecoder();
                        let buffer = "";

                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split("\n");
                                buffer = lines.pop() || "";

                                for (const line of lines) {
                                    if (line.trim() === "") continue;
                                    if (line.trim() === "data: [DONE]") continue;

                                    if (line.startsWith("data: ")) {
                                        try {
                                            const data = JSON.parse(line.slice(6));
                                            yield data;
                                        } catch (e) {
                                            console.warn("Failed to parse stream chunk:", line);
                                        }
                                    }
                                }
                            }
                        } finally {
                            reader.releaseLock();
                        }
                    })();

                } else {
                    const response = await fetch(url, {
                        method: "POST",
                        headers,
                        body,
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`AI Server Error: ${response.status} ${errorText}`);
                    }

                    const data = await response.json();
                    return data;
                }
            }
        }
    }
};

export async function testAPIConnection() {
    try {
        const response: any = await serverOpenai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, this is a test." }],
        });

        return {
            success: true,
            message: response.choices?.[0]?.message?.content || "No response",
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}
