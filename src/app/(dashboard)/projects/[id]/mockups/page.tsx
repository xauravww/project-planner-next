import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MockupsPageClient from "@/components/projects/MockupsPage";

export default async function MockupsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const mockups = await prisma.mockup.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <MockupsPageClient params={{ id }} mockups={mockups} projectName={project?.name || "Project"} />;
}
