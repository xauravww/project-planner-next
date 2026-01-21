import { NextRequest, NextResponse } from "next/server";
import { serverOpenai } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
    try {
        const { diagram, error } = await request.json();

        if (!diagram) {
            return NextResponse.json(
                { error: "Diagram code is required" },
                { status: 400 }
            );
        }

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a Mermaid diagram expert. Your task is to fix broken Mermaid diagram syntax.

IMPORTANT RULES:
1. Return ONLY the fixed Mermaid code, no explanations or markdown code fences
2. Ensure all syntax is valid Mermaid
3. Keep the diagram structure and intent the same
4. Fix common issues like:
   - Missing or incorrect keywords
   - Unclosed quotes or brackets
   - Invalid character escaping
   - Incorrect arrow syntax
   - Missing semicolons or separators
5. Use quotes around labels that contain special characters or spaces
6. Ensure all node IDs are valid (alphanumeric and underscores)`
                },
                {
                    role: "user",
                    content: `Fix this broken Mermaid diagram:

\`\`\`mermaid
${diagram}
\`\`\`

Error message: ${error || "Unknown error"}

Return ONLY the fixed Mermaid code without any markdown code fences or explanations.`
                }
            ],
            temperature: 0.3,
        });

        const fixedDiagram = response.choices[0]?.message?.content || "";

        // Clean up the response (remove any markdown code fences if AI included them)
        let cleanedDiagram = fixedDiagram.trim();
        cleanedDiagram = cleanedDiagram.replace(/^```mermaid\n?/, "");
        cleanedDiagram = cleanedDiagram.replace(/\n?```$/, "");
        cleanedDiagram = cleanedDiagram.trim();

        return NextResponse.json({ fixedDiagram: cleanedDiagram });
    } catch (error: any) {
        console.error("Error fixing mermaid diagram:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fix diagram" },
            { status: 500 }
        );
    }
}
