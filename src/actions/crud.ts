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
