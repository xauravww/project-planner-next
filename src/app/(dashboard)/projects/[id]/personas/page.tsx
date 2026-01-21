import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PersonasPageClient from "@/components/projects/PersonasPage";

export default async function PersonasPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const personas = await prisma.persona.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <PersonasPageClient params={{ id }} personas={personas} projectName={project?.name || "Project"} />;
}
