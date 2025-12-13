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
  // Placeholder implementation
  return { success: false, error: "Not implemented" };
}

export async function generateGenerationQuestions(projectId: string, type?: string) {
  // Placeholder implementation
  return { success: false, error: "Not implemented", questions: [], existingContext: [] };
}

export async function generateRequirements(projectId: string, qaPairs?: Array<{ question: string; selected: string[] }>) {
  // Placeholder implementation
  return { success: false, error: "Not implemented" };
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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a software architect. Generate a comprehensive system architecture document. Return a JSON object with the following fields:\n- 'content': Overview and design decisions (markdown).\n- 'highLevel': High-level architecture description (markdown).\n- 'lowLevel': Low-level component details (markdown).\n- 'functionalDecomposition': Functional decomposition of the system (markdown).\n- 'diagram': Mermaid diagram code.",
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
        let archData = { content: "", highLevel: "", lowLevel: "", functionalDecomposition: "", diagram: "" };

        try {
            archData = JSON.parse(aiResponse);
        } catch {
            archData = {
                content: aiResponse,
                highLevel: "High level architecture generation failed.",
                lowLevel: "Low level architecture generation failed.",
                functionalDecomposition: "Functional decomposition generation failed.",
                diagram: "graph TD\nA[Frontend] --> B[Backend]\nB --> C[Database]",
            };
        }

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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a project manager. Generate tasks for the project. Return a JSON array with objects containing: title, description, status ('TODO'), priority ('LOW', 'MEDIUM', or 'HIGH'), assignee (can be empty string or suggested role)."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 8-12 project tasks.`
                }
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let tasks = [];
        try {
            tasks = JSON.parse(aiResponse);
        } catch {
            tasks = [{ title: "Setup Project", description: "Initialize project structure", status: "TODO", priority: "HIGH", assignee: "" }];
        }

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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a UX researcher. Generate user personas for the project. Return a JSON array with objects containing: name, role, bio (brief description), goals (array of strings), frustrations (array of strings)."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 3-5 user personas.`
                }
            ],
            temperature: 0.8,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let personas = [];
        try {
            personas = JSON.parse(aiResponse);
        } catch {
            personas = [{ name: "Primary User", role: "End User", bio: "Main user of the system", goals: ["Achieve efficiency"], frustrations: ["Slow processes"] }];
        }

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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a UX designer. Generate user journey maps for the project. Return a JSON array with objects containing: title, steps (markdown formatted text describing the journey steps)."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 3-5 user journeys.`
                }
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let journeys = [];
        try {
            journeys = JSON.parse(aiResponse);
        } catch {
            journeys = [{ title: "User Onboarding", steps: "1. User signs up\n2. User verifies email\n3. User completes profile" }];
        }

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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: `You are a UI/UX expert creating ultra-specific mockup prompts for modern web interfaces.

Your prompts MUST be extremely detailed and structured. Each prompt should include ALL of these elements:

1. **Page/Screen Purpose**: What is this screen for? (e.g., "User login page", "Project dashboard", "Settings panel")

2. **Layout Structure**: Describe the layout precisely
   - Container max-width (e.g., "max-w-md for forms", "max-w-7xl for dashboards")
   - Positioning (e.g., "centered on page", "full-width with sidebar")
   - Background (e.g., "white card on gradient background", "light gray page background")

3. **Components List**: List EVERY component that should appear
   - Headers, navigation, forms, buttons, cards, icons
   - Be specific about component types (e.g., "text input with focus ring", "primary CTA button with hover scale")

4. **Color Specifications**: Use EXACT hex codes from this palette
   - Primary Blue: #3B82F6
   - Purple: #8B5CF6  
   - Green (Success): #10B981
   - Red (Error): #EF4444
   - Neutral 50: #F9FAFB (lightest)
   - Neutral 200: #E5E7EB (borders)
   - Neutral 700: #374151 (text)
   - Neutral 900: #111827 (headings)

5. **Typography Details**: Specify exact text sizes and weights
   - Headings: text-3xl font-bold, text-2xl font-semibold, etc.
   - Body: text-base, text-sm
   - Font weight: font-bold, font-semibold, font-medium, font-normal

6. **Spacing & Padding**: Use Tailwind scale
   - Card/Container padding: p-8, p-6, p-4
   - Element spacing: space-y-6, space-y-4, gap-6, gap-4
   - Margin: mt-6, mb-4, etc.

7. **Interactive States**: Describe hover/focus/active states
   - Buttons: "hover:bg-blue-600, hover:scale-105, shadow-md transition"
   - Inputs: "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
   - Cards: "hover:shadow-lg transition-shadow"

8. **Icons**: Mention specific Lucide icons if needed
   - "mail icon for email field", "lock icon for password", "check icon for success"

Return a JSON array with objects containing ONE field: "prompt" (the ultra-detailed description).

EXAMPLE PERFECT PROMPT:
"Create a modern user login page for a SaaS project management application. Layout: Center a white card (max-w-md, rounded-2xl, shadow-2xl, p-8) on a full-height page with blue-to-purple gradient background (#3B82F6 to #8B5CF6). Components: (1) Company logo/name at top (text-2xl font-bold tracking-tight #111827), (2) 'Welcome Back' heading (text-3xl font-bold tracking-tight #111827 mb-2 text-center), (3) 'Sign in to your account' subtext (text-neutral-500 text-center mb-8), (4) Email input field with label (block text-sm font-semibold #374151 mb-2, input: w-full px-4 py-3 border border-neutral-300 rounded-lg, focus:ring-2 focus:ring-blue-500), (5) Password input with label (same styling as email), (6) 'Sign In' button (w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 shadow-sm hover:shadow-md transition-all duration-200), (7) 'Forgot password?' link (text-blue-600 text-sm mt-4 text-center), (8) 'Create account' link at bottom (text-neutral-600 text-sm). Spacing: space-y-6 between form fields, p-8 card padding. Use smooth transitions (transition-all duration-200) on all interactive elements."

ANOTHER EXAMPLE:
"Create a modern analytics dashboard overview page. Layout: Full-width container (max-w-7xl mx-auto px-6 py-12) on light gray background (#F9FAFB). Components: (1) Page header with 'Analytics' title (text-4xl font-bold tracking-tight #111827) and 'Last 30 days' subtitle (text-neutral-500), (2) 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6) of metric cards, (3) Each card: white background (bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow), contains metric label (text-xs font-medium uppercase tracking-wide text-neutral-500), large number (text-3xl font-bold #111827), growth indicator (text-sm text-green-500 for positive), and colored icon in top-right (Lucide icon, w-5 h-5). Card examples: 'Total Users' with users icon (#3B82F6), 'Revenue' with dollar-sign icon (#10B981), 'Active Projects' with folder icon (#8B5CF6), 'Pending Tasks' with clipboard icon (#F59E0B). Below cards: 2-column grid (grid-cols-1 lg:grid-cols-2 gap-8 mt-8) with chart placeholders."

Now generate 4-6 ultra-specific prompts like these examples for the given project context.`
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 4-6 ultra-detailed mockup prompts for the most important screens in this project. Each prompt should be as detailed as the examples provided, with exact specifications for layout, colors (using hex codes), components, typography, spacing, and interactions.`
                }
            ],
            temperature: 0.8,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let mockups = [];
        try {
            mockups = JSON.parse(aiResponse);
        } catch {
            mockups = [{ prompt: "Modern dashboard with charts and analytics" }];
        }

        for (const mockup of mockups) {
            const imageUrl = `https://placehold.co/800x600/1a1a2e/ffffff?text=${encodeURIComponent(mockup.prompt.slice(0, 50))}`;
            await prisma.mockup.create({
                data: {
                    projectId,
                    prompt: mockup.prompt,
                    imageUrl,
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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a business analyst. Generate business rules and validation logic. Return a JSON array with objects containing: title, description, condition, action."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 5-8 business rules.`
                }
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let rules = [];
        try {
            rules = JSON.parse(aiResponse);
        } catch {
            rules = [{ title: "User Validation", description: "Validate user input", condition: "When user submits form", action: "Verify all required fields" }];
        }

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
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a project manager. Suggest team structure and roles needed. Return a JSON array with objects containing: name (suggested role name like 'Senior Developer' or 'UX Designer'), email (placeholder like 'developer@project.com'), role (job title)."
                },
                {
                    role: "user",
                    content: `Project: ${project.name}\nDescription: ${project.description || "No description"}\n\n${qaPairs ? `Preferences:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.selected.join(", ")}`).join("\n")}\n\n` : ""}Generate 4-7 team roles needed.`
                }
            ],
            temperature: 0.7,
        });

        const aiResponse = response.choices[0]?.message?.content || "[]";
        let members = [];
        try {
            members = JSON.parse(aiResponse);
        } catch {
            members = [{ name: "Lead Developer", email: "dev@project.com", role: "Full Stack Developer" }];
        }

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
