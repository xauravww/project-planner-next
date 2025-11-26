import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProjectDashboardClient from "@/components/projects/ProjectDashboardClient";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const project = await prisma.project.findFirst({
        where: {
            id,
            userId: (session.user as any).id,
        },
        include: {
            requirements: true,
            architecture: true,
            workflows: true,
            userStories: true,
            techStack: true,
            mockups: true,
        },
    });

    if (!project) {
        redirect("/dashboard");
    }

    const stats = {
        requirements: project.requirements.length,
        workflows: project.workflows.length,
        userStories: project.userStories.length,
        mockups: project.mockups.length,
    };

    return (
        <ProjectLayout
            projectId={project.id}
            projectName={project.name}
            projectType={project.description || undefined}
        >
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: project.name }
                ]} />

                <ProjectDashboardClient project={project} stats={stats} />
            </div>
        </ProjectLayout>
    );
}
