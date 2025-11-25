import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import BusinessRulesPageClient from "@/components/projects/BusinessRulesPage";

export default async function BusinessRulesPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) redirect("/auth/login");

    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        select: { name: true }
    });

    const rules = await prisma.businessRule.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
    });

    return <BusinessRulesPageClient params={{ id }} rules={rules} projectName={project?.name || "Project"} />;
}
