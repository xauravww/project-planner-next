import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserJourneysPageClient from "@/components/projects/UserJourneysPage";

export default async function UserJourneysPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const journeys = await prisma.userJourney.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <UserJourneysPageClient params={{ id }} journeys={journeys} projectName={project?.name || "Project"} />;
}
