import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import RequirementsPageClient from "@/components/projects/RequirementsPage";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default async function RequirementsPage({ params }: { params: Promise<{ id: string }> }) {
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
                <div className="border-b border-white/10 px-6 py-4 bg-black/20">
                    <Breadcrumb items={[
                        { label: result.project.name, href: `/projects/${id}` },
                        { label: "Requirements" }
                    ]} />
                </div>
                <div className="flex-1 overflow-auto">
                    <RequirementsPageClient
                        project={result.project}
                        requirements={result.project.requirements || []}
                    />
                </div>
            </div>
        </ProjectLayout>
    );
}
