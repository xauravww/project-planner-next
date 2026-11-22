import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import RequirementsConnections from "@/components/projects/RequirementsConnections";
import ProjectLayout from "@/components/projects/ProjectLayout";

export default async function ConnPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { id } = await params;
    const result = await getProject(id);
    if (result.error || !result.project) redirect("/dashboard");
    return ( <ProjectLayout projectId={id} projectName={result.project.name} projectType={result.project.description || undefined}> <div className="h-full flex flex-col bg-white"> <div className="flex-1 overflow-auto"> <RequirementsConnections projectId={id} requirements={result.project.businessRules || []} itemLabel="business rules" backHref={"/projects/" + id + "/business-rules"} editPrefix={"/projects/" + id + "/business-rules/new"} /> </div> </div> </ProjectLayout> );
}
