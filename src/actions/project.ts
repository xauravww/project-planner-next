"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serverOpenai } from "@/lib/ai-client";
import { generateEmbedding } from "@/lib/embeddings";

// Context Management Functions
export async function getProjectContext(projectId: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const contexts = await prisma.projectContext.findMany({
            where: { projectId },
            orderBy: { createdAt: "desc" },
        });

        return { contexts };
    } catch (_error) {
        console.error("Get context error:", _error);
        return { error: "Failed to get context" };
    }
}

export async function createProjectWithAI(name: string, description?: string, messages?: any[]): Promise<{ success: true; projectId: string } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Generate project summary using AI if messages are provided
        let projectDescription = description || "AI-generated project";
        if (messages && messages.length > 0) {
            const conversationText = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');

            const response = await serverOpenai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a project summarizer. Create a concise 1-2 sentence summary of what this project is about based on the conversation. Focus on the main idea, target users, and key features mentioned."
                    },
                    {
                        role: "user",
                        content: `Conversation:\n${conversationText}\n\nCreate a brief project summary.`
                    }
                ],
                max_tokens: 100,
            });

            const aiSummary = response.choices[0]?.message?.content?.trim();
            if (aiSummary) {
                projectDescription = aiSummary;
            }
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                name,
                description: projectDescription,
                userId: (session.user as any).id,
            },
        });

        // Save chat messages if provided
        if (messages && messages.length > 0) {
            await prisma.chatMessage.createMany({
                data: messages.map((msg: any) => ({
                    projectId: project.id,
                    module: "initial_chat",
                    role: msg.role,
                    content: msg.content,
                })),
            });
        }

        return { success: true, projectId: project.id };
    } catch (error: any) {
        console.error("Create project error:", error);
        return { success: false, error: error.message || "Failed to create project" };
    }
}

export async function generateGenerationQuestions(projectId: string, type?: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized", questions: [], existingContext: [] };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
            include: {
                requirements: true,
                userStories: true,
                techStack: true,
                architecture: true,
            },
        });

        if (!project) {
            return { error: "Project not found", questions: [], existingContext: [] };
        }

        // Get existing context from previous generations
        const existingContext = await prisma.projectContext.findMany({
            where: { projectId, module: type || "general" },
        });

        // Use AI to generate dynamic, project-aware questions
        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a project scoping expert. Generate 3-4 relevant, high-impact questions to help refine the generation of ${type || "project details"} for this specific project.

                    Each question should have a unique ID, a clear text, a type ("single" or "multiple"), and 4 distinct options.
                    Return ONLY a JSON array of objects with this structure. Do not include any conversational text, markdown code blocks, or introductory remarks.
                    [
                      {
                        "id": "string",
                        "text": "string",
                        "type": "single" | "multiple",
                        "options": ["string", "string", "string", "string"]
                      }
                    ]
                    
                    Ensure the questions are specific to the project description and the requested module type (${type}). Strictly return valid JSON only.`
                },
                {
                    role: "user",
                    content: `Project Name: ${project.name}\nProject Description: ${project.description || "No description provided"}\nModule Type: ${type || "general"}`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let questions = parseAIResponse(aiResponse, []);

        // Fallback to basic questions if AI fails
        if (!questions || questions.length === 0) {
            questions = [
                {
                    id: "target_audience",
                    text: "Who is the primary target audience?",
                    type: "multiple",
                    options: ["Consumer (B2C)", "Business (B2B)", "Internal Staff", "Developers"],
                },
                {
                    id: "complexity",
                    text: "What is the intended scale/complexity?",
                    type: "single",
                    options: ["MVP / Prototype", "Small business tool", "Large enterprise system", "Global scale consumer app"],
                }
            ];
        }

        return {
            success: true,
            questions,
            existingContext: existingContext.map(ctx => ({
                questionId: ctx.questionId,
                question: ctx.question,
                answers: JSON.parse(ctx.answers),
                module: ctx.module,
            })),
        };
    } catch (error) {
        console.error("Generate questions error:", error);
        return { error: "Failed to generate questions", questions: [], existingContext: [] };
    }
}


// Helper to clean and parse AI JSON responses
function parseAIResponse(content: string, fallback: any = []) {
    try {
        // Find the first occurrence of { or [ and the last occurrence of } or ]
        const firstBracket = content.indexOf('{');
        const firstSquareBracket = content.indexOf('[');

        let startIndex = -1;
        let isArray = false;

        if (firstBracket !== -1 && (firstSquareBracket === -1 || firstBracket < firstSquareBracket)) {
            startIndex = firstBracket;
            isArray = false;
        } else if (firstSquareBracket !== -1) {
            startIndex = firstSquareBracket;
            isArray = true;
        }

        if (startIndex === -1) {
            // No JSON found, try standard parsing as fallback
            return JSON.parse(content.replace(/```json\n?|```\n?/g, "").trim());
        }

        const lastIndex = isArray ? content.lastIndexOf(']') : content.lastIndexOf('}');
        if (lastIndex === -1 || lastIndex < startIndex) {
            return JSON.parse(content.replace(/```json\n?|```\n?/g, "").trim());
        }

        const jsonStr = content.substring(startIndex, lastIndex + 1);
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Failed to parse AI response:", error);
        return fallback;
    }
}

export async function generateRequirements(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const project = await prisma.project.findFirst({
            where: { id: projectId, userId: (session.user as any).id },
        });

        if (!project) {
            return { error: "Project not found" };
        }

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a requirements analyst. Generate comprehensive functional and non-functional requirements. Return ONLY a valid JSON array of requirement objects with fields: title, content, type (functional/non-functional), priority (must-have/should-have/nice-to-have). STRICT RULE: Do not include any conversational text, markdown code blocks, or explanations. Return pure JSON output.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Generate requirements.`,
                },
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const requirements = parseAIResponse(aiResponse, [{
            title: "Analysis Results",
            content: aiResponse,
            type: "functional",
            priority: "must-have",
        }]);

        for (const req of requirements) {
            await prisma.requirement.create({
                data: {
                    projectId,
                    title: req.title,
                    content: typeof req.content === 'object' ? JSON.stringify(req.content) : req.content,
                    type: req.type || "functional",
                    priority: req.priority || "should-have",
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

export async function saveProjectContext(
    projectId: string,
    questionId: string,
    question: string,
    answers: string[],
    module: string
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const existing = await prisma.projectContext.findUnique({
            where: {
                projectId_questionId: {
                    projectId,
                    questionId
                }
            }
        });

        if (existing) {
            await prisma.projectContext.update({
                where: {
                    projectId_questionId: {
                        projectId,
                        questionId
                    }
                },
                data: {
                    answers: JSON.stringify(answers),
                    module
                }
            });
        } else {
            await prisma.projectContext.create({
                data: {
                    projectId,
                    questionId,
                    question,
                    answers: JSON.stringify(answers),
                    module
                }
            });
        }

        return { success: true };
    } catch (_error) {
        console.error("Generate requirements error:", _error);
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
            messages: [
                {
                    role: "system",
                    content:
                        "You are a software architect. Generate a comprehensive system architecture document. Return ONLY a valid JSON object with the following fields:\n- 'content': Overview and design decisions (markdown).\n- 'highLevel': High-level architecture description (markdown).\n- 'lowLevel': Low-level component details (markdown).\n- 'functionalDecomposition': Functional decomposition of the system (markdown).\n- 'diagram': Mermaid diagram code.\n\nSTRICT MERMAID RULES:\n1. Wrap ALL node labels in double quotes (e.g., id[\"Label Text\"]).\n2. Use standard arrow syntax: A -->|Label| B. NEVER use A -->|Label|> B.\n3. Do not use special characters or spaces in node IDs (use alphanumeric CamelCase).\n4. Do not wrap the diagram in markdown code blocks.\n\nSTRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Generate architecture.`,
                },
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "{}";
        const archData = parseAIResponse(aiResponse, {
            content: aiResponse,
            highLevel: "High level architecture generation failed.",
            lowLevel: "Low level architecture generation failed.",
            functionalDecomposition: "Functional decomposition generation failed.",
            diagram: "graph TD\nA[Frontend] --> B[Backend]\nB --> C[Database]",
        });

        const architecture = await prisma.architecture.create({
            data: {
                projectId,
                content: archData.content,
                highLevel: archData.highLevel,
                lowLevel: archData.lowLevel,
                functionalDecomposition: archData.functionalDecomposition,
                systemDiagram: archData.diagram,
            },
        });

        generateEmbedding(archData.content, 'Architecture', architecture.id);

        revalidatePath(`/projects/${projectId}/architecture`);
        return { success: true };
    } catch (_error) {
        console.error("Generate architecture error:", _error);
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
            messages: [
                {
                    role: "system",
                    content:
                        "Generate 2-3 key workflows for this project. Return ONLY a valid JSON array with objects containing: title, content (JSON with a 'steps' field containing an ARRAY OF STRINGS), diagram (optional mermaid code). STRICT RULE: The 'steps' must be simple strings, not objects. Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }`,
                },
            ],
        });

        const workflows = parseAIResponse(response.choices[0]?.message?.content || "[]");

        for (const wf of workflows) {
            const workflow = await prisma.workflow.create({
                data: {
                    projectId,
                    title: wf.title,
                    content: typeof wf.content === "string" ? wf.content : JSON.stringify(wf.content),
                    diagram: wf.diagram,
                },
            });

            generateEmbedding(`${wf.title} ${workflow.content}`, 'Workflow', workflow.id);
        }

        revalidatePath(`/projects/${projectId}/workflows`);
        return { success: true };
    } catch (_error) {
        console.error(_error);
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
            messages: [
                {
                    role: "system",
                    content:
                        "Generate 4-6 user stories. Return ONLY a valid JSON array with objects containing: title, content, acceptanceCriteria, priority, storyPoints. STRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }`,
                },
            ],
        });

        const stories = parseAIResponse(response.choices[0]?.message?.content || "[]");

        for (const story of stories) {
            // Handle acceptanceCriteria - convert array to string if needed
            let acceptanceCriteria = story.acceptanceCriteria;
            if (Array.isArray(acceptanceCriteria)) {
                acceptanceCriteria = acceptanceCriteria.join('\n');
            }

            const userStory = await prisma.userStory.create({
                data: {
                    projectId,
                    title: story.title,
                    content: story.content,
                    acceptanceCriteria,
                    priority: story.priority || "should-have",
                    storyPoints: story.storyPoints,
                },
            });

            generateEmbedding(`${story.title} ${story.content}`, 'UserStory', userStory.id);
        }

        revalidatePath(`/projects/${projectId}/stories`);
        return { success: true };
    } catch (_error) {
        console.error(_error);
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
            messages: [
                {
                    role: "system",
                    content:
                        "You are a technical architect. Recommend a comprehensive tech stack based on the project requirements and architecture. For each technology category, provide an array of objects with 'name' and 'reason' fields explaining why it's chosen and how it addresses specific requirements or architectural needs. Return ONLY a valid JSON with: frontend (array of {name, reason}), backend (array of {name, reason}), database (array of {name, reason}), devops (array of {name, reason}), other (array of {name, reason}), and rationale (overall explanation of how the stack works together). STRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output.",
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description}\n\nRequirements:\n${requirementsSummary}${architectureContext}\n\n${qaPairs ? `User Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""
                        }Recommend a tech stack that addresses these requirements and fits the architecture.`,
                },
            ],
        });

        const stack = parseAIResponse(response.choices[0]?.message?.content || "{}", {});

        const techStack = await prisma.techStack.create({
            data: {
                projectId,
                frontend: JSON.stringify(stack.frontend || []),
                backend: JSON.stringify(stack.backend || []),
                database: JSON.stringify(stack.database || []),
                devops: JSON.stringify(stack.devops || []),
                other: JSON.stringify(stack.other || []),
                rationale: stack.rationale || "Tech stack selected based on project requirements and architecture.",
            },
        });

        generateEmbedding(JSON.stringify(stack), 'TechStack', techStack.id);

        revalidatePath(`/projects/${projectId}/tech-stack`);
        return { success: true };
    } catch (_error) {
        console.error(_error);
        return { error: "Failed to generate tech stack" };
    }
}

export async function deleteProject(projectId: string) {
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

        // Delete the project (cascade will handle all related data)
        await prisma.project.delete({
            where: { id: projectId },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (_error) {
        console.error("Delete project error:", _error);
        return { error: "Failed to delete project" };
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
    } catch (_error) {
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
                tasks: true,
                personas: true,
                userJourneys: true,
                mockups: true,
                businessRules: true,
                members: true,
            },
        });

        if (!project) {
            return { error: "Project not found" };
        }


        return { project };
    } catch (_error) {
        return { error: "Failed to fetch project" };
    }
}

// GENERATE TASKS
export async function generateTasks(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a project manager. Generate tasks for the project. Return ONLY a valid JSON array with objects containing: title, description, status ('TODO'), priority ('LOW', 'MEDIUM', or 'HIGH'), assignee (can be empty string or suggested role). STRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 8-12 project tasks.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const tasks = parseAIResponse(aiResponse, [{ title: "Setup Project", description: "Initialize project structure", status: "TODO", priority: "HIGH", assignee: "" }]);

        for (const task of tasks) {
            await prisma.task.create({
                data: {
                    projectId,
                    title: task.title,
                    description: task.description || "",
                    status: task.status || "TODO",
                    priority: task.priority || "MEDIUM",
                    assignee: task.assignee || "",
                },
            });
        }

        revalidatePath(`/projects/${projectId}/tasks`);
        return { success: true };
    } catch (_error) {
        console.error("Generate tasks error:", _error);
        return { error: "Failed to generate tasks" };
    }
}

// GENERATE PERSONAS
export async function generatePersonas(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a UX researcher. Generate user personas for the project. Return ONLY a valid JSON array with objects containing: name, role, bio (brief description), goals (array of strings), frustrations (array of strings). STRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 3-5 user personas.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const personas = parseAIResponse(aiResponse, [{ name: "Primary User", role: "End User", bio: "Main user of the system", goals: ["Achieve efficiency"], frustrations: ["Slow processes"] }]);

        for (const persona of personas) {
            await prisma.persona.create({
                data: {
                    projectId,
                    name: persona.name,
                    role: persona.role,
                    bio: persona.bio || "",
                    goals: JSON.stringify(persona.goals || []),
                    frustrations: JSON.stringify(persona.frustrations || []),
                },
            });
        }

        revalidatePath(`/projects/${projectId}/personas`);
        return { success: true };
    } catch (_error) {
        console.error("Generate personas error:", _error);
        return { error: "Failed to generate personas" };
    }
}

// GENERATE USER JOURNEYS
export async function generateUserJourneys(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a UX designer. Generate user journey maps for the project. Return ONLY a valid JSON array with objects containing: title, steps (markdown formatted text describing the journey steps). STRICT RULE: Do not include any conversational text, explanations, or markdown code blocks around the JSON. Return pure JSON output."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 3-5 user journeys.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const journeys = parseAIResponse(aiResponse, [{ title: "User Onboarding", steps: "1. User signs up\n2. User verifies email\n3. User completes profile" }]);

        for (const journey of journeys) {
            await prisma.userJourney.create({
                data: {
                    projectId,
                    title: journey.title,
                    steps: journey.steps || "",
                },
            });
        }

        revalidatePath(`/projects/${projectId}/journeys`);
        return { success: true };
    } catch (_error) {
        console.error("Generate user journeys error:", _error);
        return { error: "Failed to generate user journeys" };
    }
}

// GENERATE MOCKUPS
export async function generateMockups(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    console.log("Starting generateMockups for project:", projectId);
    const session = await auth();
    if (!session?.user) {
        console.error("Unauthorized access in generateMockups");
        return { error: "Unauthorized" };
    }

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) {
            console.error("Project not found:", projectId);
            return { error: "Project not found" };
        }

        console.log("Generating prompts for project:", project.name);

        // 1. Generate Prompts using LLM
        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a UI/UX expert creating specific image generation prompts for web interfaces.
Your goal is to describe the UI so that an image generator (like DALL-E) can render it.

Return a JSON array of objects with ONE field: "prompt".
Each prompt should be a detailed visual description of a single screen.
Include:
- Layout and composition
- Color scheme (Project specific)
- Key components (Sidebar, Dashboard, Cards)
- "High quality, professional UI design, dribbble style, vector aesthetics" keywords.

Example Prompt: "High quality UI design of a dashboard for a finance app. Dark mode, sleek sidebar on the left. Main content area shows a line chart with neon green accents. Modern typography, glassmorphism card effects. Professional, clean, 8k resolution."

Return ONLY the JSON array. Generate 2 distinct screens.`
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 2 distinct UI mockup prompts.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        console.log("AI Response received:", aiResponse);
        const mockups = parseAIResponse(aiResponse, [{ prompt: "Modern dashboard UI with dark mode and analytics charts" }]);
        console.log("Parsed mockups:", mockups);

        // 2. Create Pending Mockups (Prompt only)
        for (const mockup of mockups) {
            console.log("Creating pending mockup for prompt:", mockup.prompt);
            await prisma.mockup.create({
                data: {
                    projectId,
                    prompt: mockup.prompt,
                    imageUrl: "PENDING", // Marker for pending generation
                },
            });
        }

        revalidatePath(`/projects/${projectId}/mockups`);
        return { success: true };
    } catch (_error) {
        console.error("Generate mockups error:", _error);
        return { error: "Failed to generate mockups" };
    }
}

// GENERATE IMAGE FOR EXISTING MOCKUP
// GENERATE IMAGE FOR EXISTING MOCKUP
export async function generateMockupImage(mockupId: string) {
    console.log("Starting generateMockupImage for mockup:", mockupId);
    const session = await auth();
    if (!session?.user) {
        console.error("Unauthorized access in generateMockupImage");
        return { error: "Unauthorized" };
    }

    try {
        const mockup = await prisma.mockup.findUnique({
            where: { id: mockupId },
        });

        if (!mockup) {
            console.error("Mockup not found:", mockupId);
            return { error: "Mockup not found" };
        }

        console.log("Calling AI API for mockup image...");
        const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/v1/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_TOKEN}`
            },
            body: JSON.stringify({
                prompt: mockup.prompt + ", high quality UI design, clean, vector style, dribbble",
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            })
        });

        if (!imageResponse.ok) {
            const errText = await imageResponse.text();
            console.error(`Image generation failed: ${imageResponse.status} ${imageResponse.statusText}`, errText);
            return { error: `Image generation failed: ${imageResponse.statusText}` };
        }

        const imageData = await imageResponse.json();
        const b64Json = imageData.data?.[0]?.b64_json;

        if (!b64Json) {
            console.error("No base64 data returned from AI API");
            return { error: "No image data returned" };
        }

        console.log("Uploading to ImgBB...");
        // Upload to ImgBB
        const imgbbApiKey = process.env.IMGBB_API_KEY;
        if (!imgbbApiKey) {
            console.error("ImgBB API Key missing (IMGBB_API_KEY)");
            return { error: "ImgBB API Key missing" };
        }

        const formData = new FormData();
        formData.append("image", b64Json);

        const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errText = await uploadResponse.text();
            console.error(`ImgBB upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`, errText);
            return { error: `ImgBB upload failed: ${uploadResponse.statusText}` };
        }

        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.data?.url;

        if (!imageUrl) {
            console.error("No URL returned from ImgBB");
            return { error: "No URL returned from ImgBB" };
        }

        console.log("Saving new image URL:", imageUrl);
        await prisma.mockup.update({
            where: { id: mockupId },
            data: { imageUrl },
        });

        revalidatePath(`/projects/${mockup.projectId}/mockups`);
        return { success: true };
    } catch (error) {
        console.error("Generate mockup image error:", error);
        return { error: "Failed to generate image" };
    }
}

// GENERATE BUSINESS RULES
export async function generateBusinessRules(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a business analyst. Generate business rules and validation logic. Return ONLY a JSON array with objects containing: title, description, condition, action. Do not include any other text."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 5-8 business rules.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const rules = parseAIResponse(aiResponse, [{ title: "User Validation", description: "Validate user input", condition: "When user submits form", action: "Verify all required fields" }]);

        for (const rule of rules) {
            await prisma.businessRule.create({
                data: {
                    projectId,
                    title: rule.title,
                    description: rule.description || "",
                    condition: rule.condition || "",
                    action: rule.action || "",
                },
            });
        }

        revalidatePath(`/projects/${projectId}/business-rules`);
        return { success: true };
    } catch (_error) {
        console.error("Generate business rules error:", _error);
        return { error: "Failed to generate business rules" };
    }
}

// GENERATE TEAM MEMBERS
export async function generateTeamMembers(
    projectId: string,
    qaPairs?: Array<{ question: string; selected: string[] }>
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
            },
        });

        if (!project) return { error: "Project not found" };

        const response = await serverOpenai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a project manager. Suggest team structure and roles needed. Return ONLY a JSON array with objects containing: name (suggested role name like 'Senior Developer' or 'UX Designer'), email (placeholder like 'developer@project.com'), role (job title). Do not include any other text."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 4-7 team roles needed.`
                }
            ],
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        const members = parseAIResponse(aiResponse, [{ name: "Lead Developer", email: "dev@project.com", role: "Full Stack Developer" }]);

        for (const member of members) {
            await prisma.member.create({
                data: {
                    projectId,
                    name: member.name,
                    email: member.email || "",
                    role: member.role || "",
                },
            });
        }

        revalidatePath(`/projects/${projectId}/team`);
        return { success: true };
    } catch (_error) {
        console.error("Generate team members error:", _error);
        return { error: "Failed to generate team members" };
    }
}

// GENERATE SINGLE MOCKUP (Manual)
// GENERATE SINGLE MOCKUP (Manual)
export async function generateSingleMockup(projectId: string, prompt: string) {
    console.log("Starting generateSingleMockup for project:", projectId);
    const session = await auth();
    if (!session?.user) {
        console.error("Unauthorized access in generateSingleMockup");
        return { error: "Unauthorized" };
    }

    try {
        console.log("Calling AI API for single mockup...");
        const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/v1/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AI_TOKEN}`
            },
            body: JSON.stringify({
                prompt: prompt + ", high quality UI design, clean, vector style, dribbble",
                n: 1,
                size: "1024x1024",
                response_format: "b64_json"
            })
        });

        if (!imageResponse.ok) {
            const errText = await imageResponse.text();
            console.error(`Image generation failed: ${imageResponse.status} ${imageResponse.statusText}`, errText);
            return { error: `Image generation failed: ${imageResponse.statusText}` };
        }

        const imageData = await imageResponse.json();
        const b64Json = imageData.data?.[0]?.b64_json;

        if (!b64Json) {
            console.error("No base64 data returned from AI API");
            return { error: "No image data returned from API" };
        }

        console.log("Uploading to ImgBB...");
        // Upload to ImgBB
        const imgbbApiKey = process.env.IMGBB_API_KEY;
        if (!imgbbApiKey) {
            console.error("ImgBB API Key missing (IMGBB_API_KEY)");
            return { error: "ImgBB API Key missing" };
        }

        const formData = new FormData();
        formData.append("image", b64Json);

        const uploadResponse = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
            method: "POST",
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errText = await uploadResponse.text();
            console.error(`Image storage failed: ${uploadResponse.status} ${uploadResponse.statusText}`, errText);
            return { error: `Image storage failed: ${uploadResponse.statusText}` };
        }

        const uploadData = await uploadResponse.json();
        const publicUrl = uploadData.data?.url;

        if (!publicUrl) {
            console.error("Failed to get public URL from storage");
            return { error: "Failed to get public URL from storage" };
        }

        console.log("Creating new mockup with URL:", publicUrl);
        await prisma.mockup.create({
            data: {
                projectId,
                prompt,
                imageUrl: publicUrl,
            },
        });

        revalidatePath(`/projects/${projectId}/mockups`);
        return { success: true };
    } catch (error) {
        console.error("Generate single mockup error:", error);
        return { error: "Failed to generate mockup" };
    }
}
