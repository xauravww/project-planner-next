import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MockupViewPage from "@/components/projects/MockupViewPage";

export default async function Page({ params: paramsPromise }: { params: Promise<{ id: string; mockupId: string }> }) {
    const params = await paramsPromise;
    const session = await auth();
    if (!session?.user) redirect("/login");

    const project = await prisma.project.findFirst({
        where: {
            id: params.id,
            userId: (session.user as any).id,
        },
    });

    if (!project) redirect("/dashboard");

    const mockup = await prisma.mockup.findUnique({
        where: {
            id: params.mockupId,
        },
    });

    if (!mockup || mockup.projectId !== params.id) redirect(`/projects/${params.id}/mockups`);

    return <MockupViewPage params={params} mockup={mockup} projectName={project.name} />;
}
