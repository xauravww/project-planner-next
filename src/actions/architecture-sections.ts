// NEW: On-demand architecture section generation functions
// These generate each section individually with shared embeddings for consistency

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serverOpenai } from "@/lib/ai-client";
import { generateEmbedding } from "@/lib/embeddings";

/**
 * Generate detailed database schema section with ER diagram
 * Uses shared architecture embedding for consistency
 */
export async function generateDatabaseSection(projectId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: { architecture: true, requirements: true },
        });

        if (!project || !project.architecture) {
            return { error: "Project or architecture not found" };
        }

        //Build context from existing architecture
        const context = `
Project: ${project.name}
Description: ${project.description || ""}

High-Level Architecture:
${project.architecture.highLevel || project.architecture.content}

Requirements Summary:
${project.requirements.map(r => `- ${r.title}: ${r.content.substring(0, 200)}`).join("\n")}
        `.trim();

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a database architect. Generate comprehensive database schema documentation including:

1. **ER Diagram** (Mermaid format with relationships)
   - Use "quotes" for all node labels if they contain spaces or special characters.
   - Avoid special characters in node IDs (use CamelCase or snake_case).
2. **Table Specifications** (JSON format with complete field definitions)

Return JSON with this structure:
{
  "erDiagram": "erDiagram\\n  USER ||--o{ POST : creates\\n...",
  "tables": [
    {
      "name": "users",
      "description": "User accounts and authentication",
      "fields": [
        { "name": "id", "type": "UUID", "constraints": "PRIMARY KEY", "description": "..." },
        { "name": "email", "type": "VARCHAR(255)", "constraints": "UNIQUE NOT NULL", "description": "..." }
      ],
      "indexes": ["email", "created_at"],
      "relationships": [
        { "table": "posts", "type": "one-to-many", "foreignKey": "user_id" }
      ]
    }
  ]
}

Be thorough - include all necessary tables, fields, types, constraints, indexes, and relationships.`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            temperature: 0.3,
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        const dbData = JSON.parse(aiResponse);

        // Update architecture with database section
        await prisma.architecture.update({
            where: { projectId },
            data: {
                erDiagram: dbData.erDiagram,
                databaseSchema: JSON.stringify(dbData.tables),
            },
        });

        revalidatePath(`/projects/${projectId}/architecture`);
        return { success: true };
    } catch (error) {
        console.error("Generate database section error:", error);
        return { error: "Failed to generate database schema" };
    }
}

/**
 * Generate API specifications with sequence diagrams
 */
export async function generateAPISection(projectId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: { architecture: true, userStories: true },
        });

        if (!project || !project.architecture) {
            return { error: "Project or architecture not found" };
        }

        const context = `
Project: ${project.name}
Architecture: ${project.architecture.highLevel || project.architecture.content}
User Stories: ${project.userStories.map(s => s.title).join(", ")}
        `.trim();

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are an API architect. Generate complete API documentation with:

1. **Endpoint Specifications** - RESTful API endpoints with full details
2. **Sequence Diagrams** - Mermaid diagrams showing API flow for key operations
   - Use "quotes" for all participant names and messages.
   - Avoid special characters in participant IDs.

Return JSON:
{
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/v1/users",
      "description": "Create new user account",
      "authentication": "Bearer token required",
      "requestBody": {
        "email": "string (required)",
        "password": "string (min 8 chars, required)",
        "name": "string (optional)"
      },
      "responseSuccess": {
        "code": 201,
        "body": { "id": "uuid", "email": "string", "created_at": "timestamp" }
      },
      "responseErrors": [
        { "code": 400, "message": "Invalid email format" },
        { "code": 409, "message": "Email already exists" }
      ]
    }
  ],
  "sequenceDiagrams": [
    {
      "name": "User Registration Flow",
      "diagram": "sequenceDiagram\\n  Client->>API: POST /users\\n  API->>Database: Check email\\n..."
    }
  ]
}

Include all CRUD operations and important workflows.`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            temperature: 0.3,
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        const apiData = JSON.parse(aiResponse);

        await prisma.architecture.update({
            where: { projectId },
            data: {
                apiSpec: JSON.stringify(apiData.endpoints),
                sequenceDiagrams: JSON.stringify(apiData.sequenceDiagrams),
            },
        });

        revalidatePath(`/projects/${projectId}/architecture`);
        return { success: true };
    } catch (error) {
        console.error("Generate API section error:", error);
        return { error: "Failed to generate API specifications" };
    }
}

/**
 * Generate deployment architecture and scaling strategy
 */
export async function generateDeploymentSection(projectId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: { architecture: true, techStack: true },
        });

        if (!project || !project.architecture) {
            return { error: "Project or architecture not found" };
        }

        const context = `
Project: ${project.name}
Tech Stack: ${project.techStack?.frontend}, ${project.techStack?.backend}, ${project.techStack?.database}
Architecture: ${project.architecture.highLevel}
        `.trim();

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a DevOps architect. Generate:

1. **Deployment Diagram** (Mermaid) - Infrastructure layout with components
   - Use "quotes" for all node labels (e.g., id["Label Text"]).
   - Avoid special characters in node IDs.
2. **Scaling Strategy** (Text) - How to scale horizontally/vertically
3. **Security Design** (Text) - Security layers and measures

Return JSON:
{
  "deploymentDiagram": "graph TB\\n  LoadBalancer-->App1\\n  LoadBalancer-->App2\\n...",
  "scalingStrategy": "Detailed scaling approach...",
  "securityDesign": "Security measures: TLS, WAF, DDoS protection..."
}`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            temperature: 0.3,
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        const deployData = JSON.parse(aiResponse);

        await prisma.architecture.update({
            where: { projectId },
            data: {
                deploymentDiagram: deployData.deploymentDiagram,
                scalingStrategy: deployData.scalingStrategy,
                securityDesign: deployData.securityDesign,
            },
        });

        revalidatePath(`/projects/${projectId}/architecture`);
        return { success: true };
    } catch (error) {
        console.error("Generate deployment section error:", error);
        return { error: "Failed to generate deployment architecture" };
    }
}

/**
 * Fix invalid Mermaid diagram syntax using AI
 */
export async function fixMermaidDiagram(diagram: string, error: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a Mermaid diagram expert. Fix the following Mermaid diagram syntax error.
Return ONLY the corrected Mermaid code. Do not include markdown code blocks or explanations.

IMPORTANT FIXING RULES:
1. Wrap all node labels in quotes, e.g., A["Label Text"] instead of A[Label Text].
2. Remove special characters from node IDs (keep them alphanumeric).
3. Escape special characters inside quotes if necessary.
4. Ensure subgraph titles are quoted if they contain spaces or special characters.

Error: ${error}

Invalid Diagram:
${diagram}`
                }
            ],
            temperature: 0.1,
        });

        let fixedCode = response.choices[0]?.message?.content || diagram;

        // Strip markdown code blocks if present
        fixedCode = fixedCode.replace(/^```mermaid\n/, '').replace(/^```\n/, '').replace(/```$/, '');

        return { success: true, diagram: fixedCode.trim() };
    } catch (error) {
        console.error("Fix mermaid diagram error:", error);
        return { error: "Failed to fix diagram" };
    }
}


