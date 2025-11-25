import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TeamPageClient from "@/components/projects/TeamPage";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const members = await prisma.member.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <TeamPageClient params={{ id }} members={members} projectName={project?.name || "Project"} />;
}
