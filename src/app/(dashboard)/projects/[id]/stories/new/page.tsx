import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import NewUserStory from "@/components/projects/NewUserStory";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function NewUserStoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ edit?: string; from?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const { id } = await params;
    const { edit, from } = await searchParams;

    const result = await getProject(id);
    if (result.error || !result.project) {
        redirect("/dashboard");
    }

    let initial: any = null;
    if (edit) {
        initial = result.project.userStories?.find((s: any) => s.id === edit) || null;
    }

    const backHref = `/projects/${id}/stories`;

    return (
        <ProjectLayout
            projectId={id}
            projectName={result.project.name}
            projectType={result.project.description || undefined}
        >
            <div className="h-full flex flex-col bg-white">
                <div className="flex-1 overflow-auto">
                    <NewUserStory projectId={id} initial={initial} backHref={backHref} />
                </div>
            </div>
        </ProjectLayout>
    );
}
