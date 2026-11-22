"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getProjects } from "@/actions/project";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";

type ProjectRow = {
    id: string;
    name: string;
    description?: string | null;
    updatedAt: Date;
};

type View = "table" | "grid";

const PAGE_SIZE = 12;

const fmtDate = (d: Date) => new Date(d).toLocaleDateString();

export function ProjectsView({ projects: initial, total }: { projects: ProjectRow[]; total: number }) {
    const [view, setView] = useState<View>("table");
    const [items, setItems] = useState<ProjectRow[]>(initial);
    const [hasMore, setHasMore] = useState(initial.length < total);
    const [loading, setLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleDeleted = (id: string) => {
        setItems((prev) => prev.filter((p) => p.id !== id));
    };

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                if (!entries[0].isIntersecting || !hasMore || loading) return;
                setLoading(true);
                try {
                    const offset = items.length;
                    const result = await getProjects({ offset, limit: PAGE_SIZE });
                    const next = result.projects || [];
                    setItems((prev) => [...prev, ...next]);
                    setHasMore(offset + next.length < total);
                } catch {
                    setHasMore(false);
                } finally {
                    setLoading(false);
                }
            },
            { rootMargin: "300px" },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, items.length, total]);

    return (
        <div>
            {/* View toggle */}
            <div className="mb-4 flex items-center justify-end gap-2 font-mono text-xs uppercase tracking-tight">
                <button
                    type="button"
                    onClick={() => setView("table")}
                    className={`border-2 border-black px-3 py-1.5 transition-colors ${
                        view === "table" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                    }`}
                >
                    Table
                </button>
                <button
                    type="button"
                    onClick={() => setView("grid")}
                    className={`border-2 border-black px-3 py-1.5 transition-colors ${
                        view === "grid" ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                    }`}
                >
                    Grid
                </button>
            </div>

            {view === "table" ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-black">
                        <thead>
                            <tr className="border-b-2 border-black font-mono text-xs uppercase tracking-tight text-black/60">
                                <th className="p-3 text-left font-medium">Project</th>
                                <th className="hidden p-3 text-left font-medium md:table-cell">Description</th>
                                <th className="hidden p-3 text-left font-medium sm:table-cell">Updated</th>
                                <th className="p-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((project) => (
                                <tr key={project.id} className="border-t-2 border-black transition-colors hover:bg-black/5">
                                    <td className="max-w-0 p-3">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="block truncate font-semibold text-black transition-colors hover:text-[#FF4D00]"
                                        >
                                            {project.name}
                                        </Link>
                                    </td>
                                    <td className="hidden max-w-0 p-3 md:table-cell">
                                        <span className="block truncate text-sm text-black/60">
                                            {project.description || "—"}
                                        </span>
                                    </td>
                                    <td className="hidden p-3 font-mono text-xs uppercase tracking-tight text-black/50 sm:table-cell">
                                        {fmtDate(project.updatedAt)}
                                    </td>
                                    <td className="py-3 pl-3 pr-3 text-right">
                                        <DeleteProjectButton
                                            projectId={project.id}
                                            projectName={project.name}
                                            onDeleted={() => handleDeleted(project.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="group border-2 border-black p-4 transition-all hover:-translate-y-0.5"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="truncate text-sm font-semibold text-black transition-colors group-hover:text-[#FF4D00]">
                                    {project.name}
                                </h3>
                                <DeleteProjectButton
                                    projectId={project.id}
                                    projectName={project.name}
                                    onDeleted={() => handleDeleted(project.id)}
                                />
                            </div>
                            {project.description && (
                                <p className="mt-1.5 line-clamp-2 text-sm text-black/60">{project.description}</p>
                            )}
                            <p className="mt-3 font-mono text-[11px] uppercase tracking-tight text-black/50">
                                Updated {fmtDate(project.updatedAt)}
                            </p>
                        </Link>
                    ))}
                </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-6">
                {loading ? (
                    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60">
                        <KineticSpinner className="h-4 w-4" />
                        Loading
                    </div>
                ) : !hasMore && items.length > 0 ? (
                    <span className="font-mono text-xs uppercase tracking-tight text-black/40">
                        End of list
                    </span>
                ) : null}
            </div>
        </div>
    );
}
