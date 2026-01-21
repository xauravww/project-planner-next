import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/actions/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, FolderKanban, Search, Filter, ArrowUpRight, Clock, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import AetherBackground from "@/components/ui/aether-background";

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const result = await getProjects();
    const projects: { updatedAt: Date }[] = result.projects || [];

    const activeProjectsCount = projects.filter((p: { updatedAt: Date }) => new Date(p.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
    const aiSuggestionsCount = projects.length > 0 ? Math.floor(Math.random() * 20 + 5) : 0;

    return (
        <div className="h-full overflow-y-auto pb-32 relative bg-black">
            {/* Background Effects */}
            <AetherBackground
                variant="grid"
                overlayGradient="linear-gradient(180deg, #000000 0%, #000000e0 20%, #000000e0 80%, #000000 100%)"
                className="opacity-20 fixed inset-0 pointer-events-none"
            />

            <div className="container mx-auto px-4 pt-24 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                            Welcome back, <span className="text-zinc-500">{session.user?.name?.split(" ")[0] || "Builder"}</span>
                        </h1>
                        <p className="text-lg text-zinc-400">Here&apos;s what&apos;s happening with your projects today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="glass" className="h-12 px-6 hover:bg-white/5 text-zinc-400 hover:text-white border-white/5">
                            <Clock className="mr-2 h-4 w-4" />
                            Recent Activity
                        </Button>
                        <Link href="/dashboard/new">
                            <Button className="h-12 px-6 bg-white text-black hover:bg-zinc-200 border-0 font-bold">
                                <Plus className="mr-2 h-5 w-5" />
                                New Project
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <GlassCard className="p-6 relative overflow-hidden group border-white/10 bg-black hover:border-white/20 transition-all">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">Total Projects</div>
                                <div className="text-4xl font-bold text-white">{projects.length}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                <FolderKanban className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-zinc-500">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            <span>+2 this week</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 relative overflow-hidden group border-white/10 bg-black hover:border-white/20 transition-all">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">Active Now</div>
                                <div className="text-4xl font-bold text-white">
                                    {activeProjectsCount}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-zinc-500">
                            <span>Based on recent updates</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 relative overflow-hidden group border-white/10 bg-black hover:border-white/20 transition-all">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-zinc-400 mb-1">AI Suggestions</div>
                                <div className="text-4xl font-bold text-white">{aiSuggestionsCount}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
                                <span className="text-lg grayscale">✨</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-zinc-500">
                            <span>Available to review</span>
                        </div>
                    </GlassCard>
                </div>

                {/* Projects Section */}
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-white">Your Projects</h2>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="h-10 w-full md:w-64 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
                                />
                            </div>
                            <Button variant="glass" size="icon" className="h-10 w-10 border-white/10 text-muted-foreground hover:text-white">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link href="/dashboard/new" className="group">
                                <GlassCard className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 hover:border-white/30 bg-black transition-all duration-300">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Plus className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Create Your First Project</h3>
                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                                        Start fresh or let our AI architect the perfect structure for your next big idea.
                                    </p>
                                </GlassCard>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* New Project Card (Always visible first) */}
                            <Link href="/dashboard/new" className="group">
                                <GlassCard className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 hover:border-white/30 bg-black transition-all duration-300">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Plus className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white">New Project</h3>
                                </GlassCard>
                            </Link>

                            {projects.map((project: any) => (
                                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                                    <GlassCard className="h-full min-h-[280px] p-6 flex flex-col relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/5 transition-all duration-300 border-white/10 bg-black group-hover:border-white/20">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <DeleteProjectButton projectId={project.id} projectName={project.name} />
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-white">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                                                <span className="text-xl font-bold text-white">{project.name.charAt(0)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-zinc-300 transition-colors">{project.name}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 h-10">{project.description || "No description provided"}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-white" />
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
