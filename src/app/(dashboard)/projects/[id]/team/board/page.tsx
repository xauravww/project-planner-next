import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import TeamMap from "@/components/projects/TeamMap";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function MapPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { id } = await params;
    const result = await getProject(id);
    if (result.error || !result.project) redirect("/dashboard");
    return ( <ProjectLayout projectId={id} projectName={result.project.name} projectType={result.project.description || undefined}> <div className="h-full flex flex-col bg-white"> <div className="flex-1 overflow-auto"> <TeamMap projectId={id} members={result.project.members || []} /> </div> </div> </ProjectLayout> );
}
