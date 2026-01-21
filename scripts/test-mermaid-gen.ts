
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_AI_TOKEN || process.env.OPENAI_API_KEY,
    baseURL: process.env.NEXT_PUBLIC_AI_API_URL || process.env.OPENAI_API_URL || "https://api.openai.com/v1",
});

const PERFECT_MERMAID_PROMPT = `
You are an expert Software Architect and Mermaid.js specialist. 
Your task is to generate strict, syntactically correct Mermaid diagrams based on user descriptions.

STRICT GENERATION RULES:
1. **Format**: Return ONLY the raw Mermaid code. Do not wrap it in \`\`\`mermaid or \`\`\` blocks unless explicitly asked.
2. **Node Labels**: verify strict quoting.
   - CORRECT: A["Login Service"]
   - INCORRECT: A[Login Service]
   - INCORRECT: A(Login Service)
   - REASON: Spaces and special characters in unquoted labels cause render errors.
3. **Node IDs**: Use alphanumeric CamelCase or snake_case IDs. 
   - CORRECT: UserAuth
   - INCORRECT: User Auth
4. **Arrows**: Use standard syntax.
   - CORRECT: A -->|Label| B
   - INCORRECT: A -->|Label|> B (This is NOT valid Mermaid)
   - INCORRECT: A -> B (Unless specific graph type supports it, prefer -->)
5. **Direction**: Default to TD (Top-Down) or LR (Left-Right) for flowcharts.
6. **Styling**: Do not use inline \`style\` unless necessary. Use \`classDef\` at the end if strict styling is needed, but prefer default for compatibility.
7. **Escaping**: If a label contains quotes, escape them: "User says \\"Hello\\"".

DIAGRAM SPECIFIC RULES:
- **Flowchart**: Use \`graph TD\` or \`graph LR\`.
- **Sequence**: Use \`sequenceDiagram\`. Participants must be defined at the top if giving aliases.
- **ER Diagram**: Use \`erDiagram\`. Relationships: \`||\`, \`}|\`, \`|{\`.

Example Output:
graph TD
    User["User"] -->|Clicks Login| FE["Frontend App"]
    FE -->|API Request| Auth["Auth Service"]
    Auth -->|Validate| DB[("Database")]
`;

async function testMermaidGeneration() {
    const userPrompt = process.argv[2] || "Create a system design for a real-time chat application with websocket.";

    console.log("🚀 Testing Mermaid Generation...");
    console.log(`📝 Prompt: "${userPrompt}"`);

    try {
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL_ID || "gpt-3.5-turbo",
            messages: [
                { role: "system", content: PERFECT_MERMAID_PROMPT },
                { role: "user", content: userPrompt }
            ]
        });

        const content = response.choices[0]?.message?.content;

        console.log("\n✨ Generated Mermaid Code:\n");
        console.log("----------------------------------------");
        console.log(content);
        console.log("----------------------------------------");

    } catch (error) {
        console.error("❌ Error generating diagram:", error);
    }
}

testMermaidGeneration();
