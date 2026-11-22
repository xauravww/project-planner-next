import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import NewMember from "@/components/projects/NewMember";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function NewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string; from?: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { id } = await params;
    const { edit } = await searchParams;
    const result = await getProject(id);
    if (result.error || !result.project) redirect("/dashboard");
    let initial: any = null;
    if (edit) initial = result.project.members?.find((x: any) => x.id === edit) || null;
    return ( <ProjectLayout projectId={id} projectName={result.project.name} projectType={result.project.description || undefined}> <div className="h-full flex flex-col bg-white"> <div className="flex-1 overflow-auto"> <NewMember projectId={id} initial={initial} backHref={"/projects/" + id + "/team"} /> </div> </div> </ProjectLayout> );
}
