"use server";

import { serverOpenai } from "@/lib/ai-client";

export async function generateProjectQuestions(topic?: string) {
    try {
        const response: any = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert project planner. Generate 4-5 relevant project scoping questions to help clarify the requirements for a new project. 
                    
                    Return ONLY a JSON array of objects with the following structure. STRICT RULE: Do not include any conversational text, introductory remarks, or markdown code blocks around the JSON. Return pure JSON output.
                    [
                      {
                        "id": "unique_string_id",
                        "text": "The question text",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
                      }
                    ]
                    
                    Focus on questions that help distinguish complexity, tech stack needs, and target audience.
                    Ensure the output is valid JSON.`
                },
                {
                    role: "user",
                    content: topic
                        ? `Generate scoping questions for a project about: "${topic}"`
                        : "Generate general scoping questions for a new software project to understand its nature (web, mobile, detailed type, etc.)."
                }
            ],
        });

        const content = response.choices[0]?.message?.content || "[]";

        try {
            // Attempt to parse JSON directly
            const questions = JSON.parse(content);
            return { success: true, questions };
        } catch (e) {
            // If direct parse fails, try to extract JSON from markdown code blocks if present
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                try {
                    const questions = JSON.parse(jsonMatch[1]);
                    return { success: true, questions };
                } catch (parseError) {
                    console.error("Failed to parse extracted JSON:", parseError);
                }
            }

            console.error("Failed to parse AI response:", content);
            return { success: false, error: "Failed to parse questions", raw: content };
        }

    } catch (error) {
        console.error("Error generating questions:", error);
        return { success: false, error: "Failed to generate questions" };
    }
}
