import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TasksPageClient from "@/components/projects/TasksPage";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const tasks = await prisma.task.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <TasksPageClient params={{ id }} tasks={tasks} projectName={project?.name || "Project"} />;
}
