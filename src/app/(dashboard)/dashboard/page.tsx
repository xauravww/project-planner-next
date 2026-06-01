import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/actions/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, FolderKanban, Search, Filter, ArrowUpRight, Clock, MoreVertical, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";

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

    const result = await getProjects();
    const projects: ProjectRow[] = result.projects || [];

    const activeProjectsCount = projects.filter(
        (p) => new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length;
    const aiSuggestionsCount = projects.length > 0 ? Math.floor(Math.random() * 20 + 5) : 0;

    const stats = [
        { label: "Total projects", value: projects.length, icon: FolderKanban, note: "+2 this week", noteIcon: ArrowUpRight },
        { label: "Active now", value: activeProjectsCount, dot: true, note: "Based on recent updates" },
        { label: "AI suggestions", value: aiSuggestionsCount, emoji: "✨", note: "Available to review" },
    ];

    return (
        <div className="h-full overflow-y-auto pb-32 bg-[var(--color-nebula-bg)]">
            <div className="container mx-auto px-6 max-w-[1200px] pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-[var(--space-xxxl)]">
                    <div className="space-y-2">
                        <h1 className="type-display-xl text-[color:var(--color-nebula-fg)]">
                            Welcome back,{" "}
                            <em className="type-italic-accent">{session.user?.name?.split(" ")[0] || "Builder"}</em>
                        </h1>
                        <p className="type-subtitle">Here&apos;s what&apos;s happening with your projects today.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="nebula-ghost">
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </Button>
                        </Link>
                        <Button variant="nebula-ghost">
                            <Clock className="mr-2 h-4 w-4" />
                            Recent activity
                        </Button>
                        <Link href="/dashboard/new">
                            <Button variant="nebula">
                                <Plus className="mr-2 h-4 w-4" />
                                New project
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--space-xl)] mb-[var(--space-band)]">
                    {stats.map((s) => (
                        <GlassCard key={s.label} hoverEffect className="p-[var(--space-xl)]">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="type-small">{s.label}</div>
                                    <div className="type-h2 text-[length:var(--nebula-display-lg)]">{s.value}</div>
                                </div>
                                <div className="w-12 h-12 rounded-[var(--r-lg)] bg-[var(--color-surface-elevated)] flex items-center justify-center border border-[var(--color-nebula-hairline-strong)]">
                                    {s.icon ? <s.icon className="w-5 h-5 text-[color:var(--color-nebula-fg)]" /> : null}
                                    {s.dot ? <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-green)] animate-pulse" /> : null}
                                    {s.emoji ? <span className="text-lg grayscale">{s.emoji}</span> : null}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 type-caption">
                                {s.noteIcon ? <s.noteIcon className="w-3 h-3" /> : null}
                                <span>{s.note}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* Projects */}
                <div className="space-y-[var(--space-xl)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="type-h3">Your projects</h2>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--color-ash)]" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="h-10 w-full md:w-64 rounded-[var(--r-md)] bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] pl-10 pr-4 type-small text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)] focus:outline-none focus:border-[color:var(--color-nebula-fg)] transition-colors"
                                />
                            </div>
                            <Button variant="nebula-ghost" size="icon" className="h-10 w-10">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-xl)]">
                            <Link href="/dashboard/new" className="group">
                                <div className="h-64 flex flex-col items-center justify-center text-center p-8 rounded-[var(--r-lg)] border-2 border-dashed border-[var(--color-nebula-hairline-strong)] hover:border-[var(--color-nebula-fg)] bg-[var(--color-nebula-surface)] transition-colors">
                                    <div className="w-14 h-14 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                        <Plus className="w-7 h-7 text-[color:var(--color-nebula-fg)]" />
                                    </div>
                                    <h3 className="type-h3 mb-2">Create your first project</h3>
                                    <p className="type-small max-w-xs mx-auto">
                                        Start fresh or let our AI architect the perfect structure for your next idea.
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--space-xl)]">
                            <Link href="/dashboard/new" className="group">
                                <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 rounded-[var(--r-lg)] border-2 border-dashed border-[var(--color-nebula-hairline-strong)] hover:border-[var(--color-nebula-fg)] bg-[var(--color-nebula-surface)] transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6 text-[color:var(--color-nebula-fg)]" />
                                    </div>
                                    <h3 className="type-h4">New project</h3>
                                </div>
                            </Link>

                            {projects.map((project) => (
                                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                                    <GlassCard hoverEffect className="h-full min-h-[280px] p-6 flex flex-col relative overflow-hidden hover:-translate-y-1 transition-transform">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <DeleteProjectButton projectId={project.id} projectName={project.name} />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)]">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="mb-6">
                                            <div className="w-12 h-12 rounded-[var(--r-md)] bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)] flex items-center justify-center mb-4">
                                                <span className="type-h4 text-[color:var(--color-nebula-fg)]">{project.name.charAt(0)}</span>
                                            </div>
                                            <h3 className="type-h4 mb-2 line-clamp-1">{project.name}</h3>
                                            <p className="type-small line-clamp-2 h-10">{project.description || "No description provided"}</p>
                                        </div>

                                        <div className="mt-auto pt-4 nebula-hairline-t flex items-center justify-between type-caption">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]" />
                                                <span>Active</span>
                                            </div>
                                            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
