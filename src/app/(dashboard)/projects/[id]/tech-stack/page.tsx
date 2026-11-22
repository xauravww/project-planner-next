import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import TechStackPageClient from "@/components/projects/TechStackPage";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function TechStackPage({ params }: { params: Promise<{ id: string }> }) {
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
            <TechStackPageClient
                project={result.project}
                initialTechStack={result.project.techStack}
            />
        </ProjectLayout>
    );
}
