import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProject } from "@/actions/project";
import { RefineChat } from "@/components/dashboard/RefineChat";

export default async function GenPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect("/login");
    const { id } = await params;
    const result = await getProject(id);
    if (!result.project) redirect("/dashboard");
    const project = result.project;
    const artifactCount = project.requirements.length + project.userStories.length + project.personas.length + project.userJourneys.length + project.workflows.length + project.tasks.length + project.businessRules.length + (project.architecture ? 1 : 0) + (project.techStack ? 1 : 0) + project.mockups.length;
    const artifactBreakdown = { Requirements: project.requirements.length, "User Stories": project.userStories.length, Personas: project.personas.length, "User Journeys": project.userJourneys.length, Workflows: project.workflows.length, Tasks: project.tasks.length, "Business Rules": project.businessRules.length, Architecture: project.architecture ? 1 : 0, "Tech Stack": project.techStack ? 1 : 0, Mockups: project.mockups.length };
    return ( <RefineChat mode="open" artifact="businessrules" projectId={project.id} projectName={project.name} description={project.description || ""} artifactCount={artifactCount} artifactBreakdown={artifactBreakdown} /> );
}
