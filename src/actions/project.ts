"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serverOpenai } from "@/lib/ai-client";
import { generateEmbedding } from "@/lib/embeddings";

export async function generateGenerationQuestions(projectId: string, type: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: { requirements: true, architecture: true } // Include context if available
        });

        if (!project) return { error: "Project not found" };

        let context = `Project: ${project.name}\nDescription: ${project.description}`;

        // Add specific context based on type
        if (type === 'tech-stack' || type === 'workflows') {
            if (project.requirements.length) {
                context += `\n\nRequirements Summary: ${project.requirements.map(r => r.title).join(', ')}`;
            }
            if (project.architecture) {
                context += `\n\nArchitecture: ${project.architecture.content.substring(0, 200)}...`;
            }
        }

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are an expert project manager. Based on the project description, generate 3-4 multiple choice questions to help clarify the specific needs for generating ${type}. 
                    Each question should have 3-5 options. The user can select multiple options. 
                    Return a JSON array of objects with:
                    - id: string (unique)
                    - text: string (the question)
                    - options: string[] (possible answers)`
                },
                {
                    role: "user",
                    content: context
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content || "{\"questions\": []}";
        let questions = [];
        try {
            const parsed = JSON.parse(content);
            questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch (e) {
            console.error("Failed to parse questions", e);
            // Fallback questions
            questions = [
                {
                    id: "q1",
                    text: "What is the primary focus?",
                    options: ["Speed", "Security", "Scalability", "User Experience"]
                }
            ];
        }

        return { questions };
    } catch (error) {
        console.error("Generate questions error:", error);
        return { error: "Failed to generate questions" };
    }
}

export async function createProjectWithAI(
    name: string,
    description: string,
    chatHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>
) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        // Generate embedding for project
        const projectText = `${name} ${description}`;
        const embedding = await generateEmbedding(projectText);

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId: (session.user as any).id,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath("/dashboard");
        return { success: true, projectId: project.id };
    } catch (error) {
        console.error("Create project error:", error);
        return { error: "Failed to create project" };
    }
}

export async function generateRequirements(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) {
            return { error: "Project not found" };
        }

        // Call real AI
        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a software requirements analyst. Generate functional and non-functional requirements for the given project. Return a JSON array with objects containing: title, content, type ('functional' or 'non-functional'), priority ('must-have', 'should-have', or 'nice-to-have').",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description provided"}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Generate 5-7 requirements.`,
                },
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";

        // Try to parse JSON, fallback to basic parsing if fails
        let requirements = [];
        try {
            requirements = JSON.parse(aiResponse);
        } catch {
            // Fallback: create default requirements
            requirements = [
                {
                    title: "User Authentication",
                    content: "System must provide secure user authentication",
                    type: "functional",
                    priority: "must-have",
                },
            ];
        }

        // Create requirements with embeddings
        for (const req of requirements) {
            const reqText = `${req.title} ${req.content}`;
            const embedding = await generateEmbedding(reqText);

            await prisma.requirement.create({
                data: {
                    projectId,
                    title: req.title,
                    content: req.content,
                    type: req.type,
                    priority: req.priority,
                    embedding: JSON.stringify(embedding),
                },
            });
        }

        revalidatePath(`/projects/${projectId}/requirements`);
        return { success: true };
    } catch (error) {
        console.error("Generate requirements error:", error);
        return { error: "Failed to generate requirements" };
    }
}

export async function generateArchitecture(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
        });

        if (!project) {
            return { error: "Project not found" };
        }

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a software architect. Generate a system architecture document with: overview, components, and design decisions. Also provide a simple Mermaid diagram code. Return a JSON object with 'content' (markdown text) and 'diagram' (mermaid code) fields.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Generate architecture.`,
                },
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        let archData = { content: "", diagram: "" };

        try {
            archData = JSON.parse(aiResponse);
        } catch {
            archData = {
                content: aiResponse,
                diagram: "graph TD\nA[Frontend] --> B[Backend]\nB --> C[Database]",
            };
        }

        const embedding = await generateEmbedding(archData.content);

        await prisma.architecture.create({
            data: {
                projectId,
                content: archData.content,
                diagram: archData.diagram,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/architecture`);
        return { success: true };
    } catch (error) {
        console.error("Generate architecture error:", error);
        return { error: "Failed to generate architecture" };
    }
}

// Similar functions for workflows, user stories, tech stack...
// I'll create abbreviated versions to save space

export async function generateWorkflows(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "Generate 2-3 key workflows for this project. Return JSON array with: title, content (JSON with steps array), diagram (optional mermaid code).",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }`,
                },
            ],
        });

        const workflows = JSON.parse(response.choices[0]?.message?.content || "[]");

        for (const wf of workflows) {
            const embedding = await generateEmbedding(`${wf.title} ${JSON.stringify(wf.content)}`);
            await prisma.workflow.create({
                data: {
                    projectId,
                    title: wf.title,
                    content: typeof wf.content === "string" ? wf.content : JSON.stringify(wf.content),
                    diagram: wf.diagram,
                    embedding: JSON.stringify(embedding),
                },
            });
        }

        revalidatePath(`/projects/${projectId}/workflows`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate workflows" };
    }
}

export async function generateUserStories(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "Generate 4-6 user stories. Return JSON array with: title, content, acceptanceCriteria, priority, storyPoints.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }`,
                },
            ],
        });

        const stories = JSON.parse(response.choices[0]?.message?.content || "[]");

        for (const story of stories) {
            const embedding = await generateEmbedding(`${story.title} ${story.content}`);

            // Handle acceptanceCriteria - convert array to string if needed
            let acceptanceCriteria = story.acceptanceCriteria;
            if (Array.isArray(acceptanceCriteria)) {
                acceptanceCriteria = acceptanceCriteria.join('\n');
            }

            await prisma.userStory.create({
                data: {
                    projectId,
                    title: story.title,
                    content: story.content,
                    acceptanceCriteria: acceptanceCriteria || null,
                    priority: story.priority,
                    storyPoints: story.storyPoints,
                    embedding: JSON.stringify(embedding),
                },
            });
        }

        revalidatePath(`/projects/${projectId}/stories`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate user stories" };
    }
}

export async function generateTechStack(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: {
                requirements: true,
                architecture: true,
            },
        });

        if (!project) return { error: "Project not found" };

        // Build context from requirements and architecture
        const requirementsSummary = project.requirements
            .map((req) => `- ${req.title} (${req.type}, ${req.priority}): ${req.content}`)
            .join("\n");

        const architectureContext = project.architecture
            ? `\n\nArchitecture Overview:\n${project.architecture.content}`
            : "";

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a technical architect. Recommend a comprehensive tech stack based on the project requirements and architecture. For each technology category, provide an array of objects with 'name' and 'reason' fields explaining why it's chosen and how it addresses specific requirements or architectural needs. Return JSON with: frontend (array of {name, reason}), backend (array of {name, reason}), database (array of {name, reason}), devops (array of {name, reason}), other (array of {name, reason}), and rationale (overall explanation of how the stack works together).",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\nRequirements:\n${requirementsSummary}${architectureContext}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Recommend a tech stack that addresses these requirements and fits the architecture.`,
                },
            ],
        });

        const stack = JSON.parse(response.choices[0]?.message?.content || "{}");
        const embedding = await generateEmbedding(JSON.stringify(stack));

        await prisma.techStack.create({
            data: {
                projectId,
                frontend: JSON.stringify(stack.frontend || []),
                backend: JSON.stringify(stack.backend || []),
                database: JSON.stringify(stack.database || []),
                devops: JSON.stringify(stack.devops || []),
                other: JSON.stringify(stack.other || []),
                rationale: stack.rationale || "Tech stack selected based on project requirements and architecture.",
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/tech-stack`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate tech stack" };
    }
}

export async function getProjects() {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const projects = await prisma.project.findMany({
            where: { userId: (session.user as any).id },
            orderBy: { updatedAt: "desc" },
        });

        return { projects };
    } catch (error) {
        return { error: "Failed to fetch projects" };
    }
}

export async function getProject(projectId: string) {
    const session = await auth();
    if (!session?.user) {
        return { error: "Unauthorized" };
    }

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
            include: {
                requirements: true,
                architecture: true,
                workflows: true,
                userStories: true,
                techStack: true,
            },
        });

        if (!project) {
            return { error: "Project not found" };
        }

        return { project };
    } catch (error) {
        return { error: "Failed to fetch project" };
    }
}
