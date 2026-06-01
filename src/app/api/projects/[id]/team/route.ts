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
        const members = await prisma.member.findMany({
            where: {
                projectId: id,
                project: { userId: session.user.id },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("Failed to fetch team members:", error);
        return NextResponse.json(
            { error: "Failed to fetch team members" },
            { status: 500 }
        );
    }
}
