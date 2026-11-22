import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import ArchitecturePageClient from "@/components/projects/ArchitecturePage";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function ArchitecturePage({ params }: { params: Promise<{ id: string }> }) {
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
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto overflow-x-hidden">
                    <ArchitecturePageClient
                        project={result.project}
                        initialArchitecture={result.project.architecture}
                        staleStatus={result.project.staleStatus ? JSON.parse(result.project.staleStatus) : {}}
                    />
                </div>
            </div>
        </ProjectLayout>
    );
}
