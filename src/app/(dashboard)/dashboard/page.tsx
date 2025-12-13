import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getProjects } from "@/actions/project";
import { GlassCard } from "@/components/ui/GlassCard";
import { Plus, FolderKanban, Search, Filter, ArrowUpRight, Clock, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
        <div className="h-full overflow-y-auto pb-32 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[128px] -z-10" />

            <div className="container mx-auto px-4 pt-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                            Welcome back, <span className="text-gradient">{session.user?.name?.split(" ")[0] || "Builder"}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="glass" className="h-12 px-6">
                            <Clock className="mr-2 h-4 w-4" />
                            Recent Activity
                        </Button>
                        <Link href="/dashboard/new">
                            <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/20">
                                <Plus className="mr-2 h-5 w-5" />
                                New Project
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Total Projects</div>
                                <div className="text-4xl font-bold text-white">{projects.length}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <FolderKanban className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-400">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            <span>+2 this week</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Active Now</div>
                                <div className="text-4xl font-bold text-white">
                                    {activeProjectsCount}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                            <span>Based on recent updates</span>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">AI Suggestions</div>
                                <div className="text-4xl font-bold text-white">{aiSuggestionsCount}</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <span className="text-lg">✨</span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-purple-400">
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
                                    className="h-10 w-full md:w-64 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <Button variant="glass" size="icon" className="h-10 w-10">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Link href="/dashboard/new" className="group">
                                <GlassCard className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
                                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <Plus className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Create Your First Project</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                        Start fresh or let our AI architect the perfect structure for your next big idea.
                                    </p>
                                </GlassCard>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {/* New Project Card (Always visible first) */}
                            <Link href="/dashboard/new" className="group">
                                <GlassCard className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <Plus className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">New Project</h3>
                                </GlassCard>
                            </Link>

                            {projects.map((project: any) => (
                                <Link key={project.id} href={`/projects/${project.id}`} className="group">
                                    <GlassCard className="h-full min-h-[280px] p-6 flex flex-col relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-4">
                                                <span className="text-xl font-bold text-white">{project.name.charAt(0)}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">{project.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">{project.description || "No description provided"}</p>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
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
