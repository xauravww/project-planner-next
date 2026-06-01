import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
            include: {
                techStack: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project.techStack);
    } catch (error) {
        console.error("Failed to fetch tech stack:", error);
        return NextResponse.json(
            { error: "Failed to fetch tech stack" },
            { status: 500 }
        );
    }
}
