import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import MockupViewPage from "@/components/projects/MockupViewPage";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string; mockupId: string }>;
}) {
    const { id, mockupId } = await params;
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/login");
    }

    const project = await prisma.project.findUnique({
        where: {
            id: id,
            userId: (session.user as any).id,
        },
    });

    if (!project) {
        notFound();
    }

    const mockup = await prisma.mockup.findUnique({
        where: {
            id: mockupId,
            projectId: id,
        },
    });

    if (!mockup) {
        notFound();
    }

    return (
        <MockupViewPage
            params={{ id, mockupId }}
            mockup={mockup}
            projectName={project.name}
        />
    );
}
