import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import WorkflowsPageClient from "@/components/projects/WorkflowsPage";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function WorkflowsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");

    const { id } = await params;
    const result = await getProject(id);
    if (result.error || !result.project) {
        redirect("/dashboard");
    }

    return (
        <ProjectLayout
            projectId={id}
            projectName={result.project.name}
            projectType={result.project.description || undefined}
        >
            <WorkflowsPageClient
                project={result.project}
                initialWorkflows={result.project.workflows || []}
            />
        </ProjectLayout>
    );
}
