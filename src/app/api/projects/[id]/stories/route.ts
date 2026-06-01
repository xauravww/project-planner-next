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
        const stories = await prisma.userStory.findMany({
            where: {
                projectId: id,
                project: { userId: session.user.id },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(stories);
    } catch (error) {
        console.error("Failed to fetch user stories:", error);
        return NextResponse.json(
            { error: "Failed to fetch user stories" },
            { status: 500 }
        );
    }
}
