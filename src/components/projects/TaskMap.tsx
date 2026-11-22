"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

export default function TaskMap({ projectId, tasks }: { projectId: string; tasks: any[] }) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const byPriority = PRIORITIES.map((p) => ({ key: p, count: tasks.filter((t) => (t.priority || "MEDIUM").toUpperCase() === p).length }));
        const byStatus = STATUSES.map((s) => ({ key: s, count: tasks.filter((t) => (t.status || "TODO").toUpperCase() === s).length }));
        return { total, byPriority, byStatus };
    }, [tasks]);

    if (tasks.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No tasks yet.</p>
                <Link href={`/projects/${projectId}/tasks/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate tasks
                </Link>
            </div>
        );
    }

    const maxP = Math.max(...stats.byPriority.map((x) => x.count), 1);
    const maxS = Math.max(...stats.byStatus.map((x) => x.count), 1);

    const bar = (count: number, max: number, color: string) => (
        <div className="mt-1 h-2 w-full border border-black bg-black/5">
            <div className="h-full" style={{ background: color, width: `${(count / max) * 100}%` }} />
        </div>
    );

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/tasks`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} tasks</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By priority</div>
                        <div className="mt-3 space-y-3">
                            {stats.byPriority.map((p) => (
                                <div key={p.key}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{p.key}</span><span>{p.count}</span>
                                    </div>
                                    {bar(p.count, maxP, p.key === "HIGH" ? "#FF4D00" : p.key === "MEDIUM" ? "#2563EB" : "#16A34A")}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By status</div>
                        <div className="mt-3 space-y-3">
                            {stats.byStatus.map((s) => (
                                <div key={s.key}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{s.key.replace("_", " ")}</span><span>{s.count}</span>
                                    </div>
                                    {bar(s.count, maxS, s.key === "DONE" ? "#16A34A" : s.key === "IN_PROGRESS" ? "#FF4D00" : "#000")}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/tasks`} className="nebula-btn nebula-btn--primary flex-1 justify-center">View tasks</Link>
                        <Link href={`/projects/${projectId}/tasks/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">Generate more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
