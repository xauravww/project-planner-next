import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/actions/project";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProjectsView } from "@/components/dashboard/ProjectsView";
import { SearchInput } from "@/components/dashboard/SearchInput";

type ProjectRow = {
    id: string;
    name: string;
    description?: string | null;
    updatedAt: Date;
};

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const result = await getProjects({ limit: 12 });
    const projects: ProjectRow[] = result.projects || [];
    const total = result.total ?? projects.length;

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-6 max-w-[1400px] py-6 md:py-10">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h1 className="type-display text-[length:clamp(2rem,4.5vw,3.5rem)]">
                            Your projects
                        </h1>
                        <p className="mt-2 text-base text-black/80">
                            Welcome back, {session.user?.name?.split(" ")[0] || "Builder"}
                        </p>
                    </div>
                    <Link href="/dashboard/new" className="nebula-btn nebula-btn--primary w-fit">
                        <Plus className="h-4 w-4" />
                        New project
                    </Link>
                </div>

                <div className="mt-8 mb-6 border-b-2 border-black" />

                {/* Empty state — single focus */}
                {total === 0 ? (
                    <div className="flex justify-center pt-8">
                        <Link
                            href="/dashboard/new"
                            className="group block w-full max-w-xl border-2 border-dashed border-black p-12 text-center transition-colors hover:bg-black/5"
                        >
                            <span className="mx-auto grid h-16 w-16 place-items-center border-2 border-black transition-transform group-hover:scale-110">
                                <Plus className="h-8 w-8" />
                            </span>
                            <h2 className="type-h2 mt-8">Create your first project</h2>
                            <p className="mx-auto mt-4 max-w-sm text-black/70">
                                Describe an idea and NebulaPlan structures it into user stories,
                                architecture, and tasks.
                            </p>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Projects toolbar — search only; page title already says "Your projects" */}
                        <div className="mt-6 flex items-center justify-end border-b-2 border-black pb-4">
                            <SearchInput />
                        </div>

                        {/* Projects list with Table/Grid toggle + infinite scroll */}
                        <div className="mt-6">
                            <ProjectsView projects={projects} total={total} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
