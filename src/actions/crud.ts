"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateEmbedding } from "@/lib/embeddings";

// REQUIREMENT CRUD
export async function createRequirement(
    projectId: string,
    data: { title: string; content: string; type: string; priority: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const requirement = await prisma.requirement.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/requirements`);
        return { success: true, requirement };
    } catch (error) {
        return { error: "Failed to create requirement" };
    }
}

export async function updateRequirement(
    id: string,
    data: { title: string; content: string; type: string; priority: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const requirement = await prisma.requirement.update({
            where: { id },
            data: {
                ...data,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${requirement.projectId}/requirements`);
        return { success: true, requirement };
    } catch (error) {
        return { error: "Failed to update requirement" };
    }
}

export async function deleteRequirement(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const requirement = await prisma.requirement.delete({ where: { id } });
        revalidatePath(`/projects/${requirement.projectId}/requirements`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete requirement" };
    }
}

// USER STORY CRUD
export async function createUserStory(
    projectId: string,
    data: {
        title: string;
        content: string;
        acceptanceCriteria?: string;
        priority: string;
        storyPoints?: number;
    }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const story = await prisma.userStory.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/stories`);
        return { success: true, story };
    } catch (error) {
        return { error: "Failed to create user story" };
    }
}

export async function updateUserStory(
    id: string,
    data: {
        title: string;
        content: string;
        acceptanceCriteria?: string;
        priority: string;
        storyPoints?: number;
    }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const story = await prisma.userStory.update({
            where: { id },
            data: {
                ...data,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${story.projectId}/stories`);
        return { success: true, story };
    } catch (error) {
        return { error: "Failed to update user story" };
    }
}

export async function deleteUserStory(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const story = await prisma.userStory.delete({ where: { id } });
        revalidatePath(`/projects/${story.projectId}/stories`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete user story" };
    }
}

// WORKFLOW CRUD
export async function createWorkflow(
    projectId: string,
    data: { title: string; content: string; diagram?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const workflow = await prisma.workflow.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/workflows`);
        return { success: true, workflow };
    } catch (error) {
        return { error: "Failed to create workflow" };
    }
}

export async function updateWorkflow(
    id: string,
    data: { title: string; content: string; diagram?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.content}`);

        const workflow = await prisma.workflow.update({
            where: { id },
            data: {
                ...data,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${workflow.projectId}/workflows`);
        return { success: true, workflow };
    } catch (error) {
        return { error: "Failed to update workflow" };
    }
}

export async function deleteWorkflow(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const workflow = await prisma.workflow.delete({ where: { id } });
        revalidatePath(`/projects/${workflow.projectId}/workflows`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete workflow" };
    }
}

// UPDATE ARCHITECTURE
export async function updateArchitecture(
    id: string,
    data: { content: string; diagram?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(data.content);

        const architecture = await prisma.architecture.update({
            where: { id },
            data: {
                ...data,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${architecture.projectId}/architecture`);
        return { success: true, architecture };
    } catch (error) {
        return { error: "Failed to update architecture" };
    }
}

export async function deleteArchitecture(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const architecture = await prisma.architecture.delete({ where: { id } });
        revalidatePath(`/projects/${architecture.projectId}/architecture`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete architecture" };
    }
}

// UPDATE TECH STACK
export async function updateTechStack(
    id: string,
    data: {
        frontend?: string[];
        backend?: string[];
        database?: string[];
        devops?: string[];
        other?: string[];
    }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(JSON.stringify(data));

        const techStack = await prisma.techStack.update({
            where: { id },
            data: {
                frontend: data.frontend ? JSON.stringify(data.frontend) : undefined,
                backend: data.backend ? JSON.stringify(data.backend) : undefined,
                database: data.database ? JSON.stringify(data.database) : undefined,
                devops: data.devops ? JSON.stringify(data.devops) : undefined,
                other: data.other ? JSON.stringify(data.other) : undefined,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${techStack.projectId}/tech-stack`);
        return { success: true, techStack };
    } catch (error) {
        return { error: "Failed to update tech stack" };
    }
}

export async function deleteTechStack(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const techStack = await prisma.techStack.delete({ where: { id } });
        revalidatePath(`/projects/${techStack.projectId}/tech-stack`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete tech stack" };
    }
}

// TASKS CRUD
export async function createTask(
    projectId: string,
    data: { title: string; description?: string; status: string; priority: string; assignee?: string; dueDate?: Date }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.description || ""}`);

        const task = await prisma.task.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/tasks`);
        return { success: true, task };
    } catch (error) {
        return { error: "Failed to create task" };
    }
}

export async function updateTask(
    id: string,
    data: { title?: string; description?: string; status?: string; priority?: string; assignee?: string; dueDate?: Date }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        let embedding = undefined;
        if (data.title || data.description) {
            embedding = JSON.stringify(await generateEmbedding(`${data.title || ""} ${data.description || ""}`));
        }

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...data,
                embedding,
            },
        });

        revalidatePath(`/projects/${task.projectId}/tasks`);
        return { success: true, task };
    } catch (error) {
        return { error: "Failed to update task" };
    }
}

export async function deleteTask(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const task = await prisma.task.delete({ where: { id } });
        revalidatePath(`/projects/${task.projectId}/tasks`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete task" };
    }
}

// PERSONAS CRUD
export async function createPersona(
    projectId: string,
    data: { name: string; role: string; goals: string; frustrations: string; bio: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.name} ${data.role} ${data.bio}`);

        const persona = await prisma.persona.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/personas`);
        return { success: true, persona };
    } catch (error) {
        return { error: "Failed to create persona" };
    }
}

export async function updatePersona(
    id: string,
    data: { name?: string; role?: string; goals?: string; frustrations?: string; bio?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        let embedding = undefined;
        if (data.name || data.role || data.bio) {
            embedding = JSON.stringify(await generateEmbedding(`${data.name || ""} ${data.role || ""} ${data.bio || ""}`));
        }

        const persona = await prisma.persona.update({
            where: { id },
            data: {
                ...data,
                embedding,
            },
        });

        revalidatePath(`/projects/${persona.projectId}/personas`);
        return { success: true, persona };
    } catch (error) {
        return { error: "Failed to update persona" };
    }
}

export async function deletePersona(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const persona = await prisma.persona.delete({ where: { id } });
        revalidatePath(`/projects/${persona.projectId}/personas`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete persona" };
    }
}

// USER JOURNEYS CRUD
export async function createUserJourney(
    projectId: string,
    data: { title: string; personaId?: string; steps: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.steps}`);

        const journey = await prisma.userJourney.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/journeys`);
        return { success: true, journey };
    } catch (error) {
        return { error: "Failed to create user journey" };
    }
}

export async function updateUserJourney(
    id: string,
    data: { title?: string; personaId?: string; steps?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        let embedding = undefined;
        if (data.title || data.steps) {
            embedding = JSON.stringify(await generateEmbedding(`${data.title || ""} ${data.steps || ""}`));
        }

        const journey = await prisma.userJourney.update({
            where: { id },
            data: {
                ...data,
                embedding,
            },
        });

        revalidatePath(`/projects/${journey.projectId}/journeys`);
        return { success: true, journey };
    } catch (error) {
        return { error: "Failed to update user journey" };
    }
}

export async function deleteUserJourney(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const journey = await prisma.userJourney.delete({ where: { id } });
        revalidatePath(`/projects/${journey.projectId}/journeys`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete user journey" };
    }
}

// MOCKUPS CRUD
export async function createMockup(
    projectId: string,
    data: { prompt: string; imageUrl: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const mockup = await prisma.mockup.create({
            data: {
                ...data,
                projectId,
            },
        });

        revalidatePath(`/projects/${projectId}/mockups`);
        return { success: true, mockup };
    } catch (error) {
        return { error: "Failed to create mockup" };
    }
}

export async function deleteMockup(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const mockup = await prisma.mockup.delete({ where: { id } });
        revalidatePath(`/projects/${mockup.projectId}/mockups`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete mockup" };
    }
}

// BUSINESS RULES CRUD
export async function createBusinessRule(
    projectId: string,
    data: { title: string; description: string; condition?: string; action?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const embedding = await generateEmbedding(`${data.title} ${data.description}`);

        const rule = await prisma.businessRule.create({
            data: {
                ...data,
                projectId,
                embedding: JSON.stringify(embedding),
            },
        });

        revalidatePath(`/projects/${projectId}/business-rules`);
        return { success: true, rule };
    } catch (error) {
        return { error: "Failed to create business rule" };
    }
}

export async function updateBusinessRule(
    id: string,
    data: { title?: string; description?: string; condition?: string; action?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        let embedding = undefined;
        if (data.title || data.description) {
            embedding = JSON.stringify(await generateEmbedding(`${data.title || ""} ${data.description || ""}`));
        }

        const rule = await prisma.businessRule.update({
            where: { id },
            data: {
                ...data,
                embedding,
            },
        });

        revalidatePath(`/projects/${rule.projectId}/business-rules`);
        return { success: true, rule };
    } catch (error) {
        return { error: "Failed to update business rule" };
    }
}

export async function deleteBusinessRule(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const rule = await prisma.businessRule.delete({ where: { id } });
        revalidatePath(`/projects/${rule.projectId}/business-rules`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete business rule" };
    }
}

// MEMBERS CRUD
export async function createMember(
    projectId: string,
    data: { name: string; role: string; email: string; avatar?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const member = await prisma.member.create({
            data: {
                ...data,
                projectId,
            },
        });

        revalidatePath(`/projects/${projectId}/team`);
        return { success: true, member };
    } catch (error) {
        return { error: "Failed to create member" };
    }
}

export async function updateMember(
    id: string,
    data: { name?: string; role?: string; email?: string; avatar?: string }
) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const member = await prisma.member.update({
            where: { id },
            data,
        });

        revalidatePath(`/projects/${member.projectId}/team`);
        return { success: true, member };
    } catch (error) {
        return { error: "Failed to update member" };
    }
}

export async function deleteMember(id: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const member = await prisma.member.delete({ where: { id } });
        revalidatePath(`/projects/${member.projectId}/team`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete member" };
    }
}

// AI TEXT IMPROVEMENT
export async function improveText(text: string, context?: string) {
    const session = await auth();
    if (!session?.user) return { error: "Unauthorized" };

    try {
        const { serverOpenai } = await import("@/lib/ai-client");

        const response = await serverOpenai.chat.completions.create({
            model: "grok-code",
            messages: [
                {
                    role: "system",
                    content: "You are a professional writer and editor. Improve the given text to make it clearer, more concise, and more professional. Maintain the core meaning and intent. Return only the improved text without any additional commentary."
                },
                {
                    role: "user",
                    content: context
                        ? `Context: ${context}\n\nText to improve:\n${text}`
                        : `Text to improve:\n${text}`
                }
            ],
            temperature: 0.7,
        });

        const improvedText = response.choices[0]?.message?.content || text;
        return { success: true, improvedText: improvedText.trim() };
    } catch (error) {
        console.error("Improve text error:", error);
        return { error: "Failed to improve text" };
    }
}

