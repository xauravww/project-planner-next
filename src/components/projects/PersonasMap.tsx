"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const toArray = (val: any): string[] => {
    if (typeof val === "string") {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            // ignore
        }
        return val.trim() ? val.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    }
    return Array.isArray(val) ? val.map(String) : [];
};

export default function PersonasMap({ projectId, personas }: { projectId: string; personas: any[] }) {
    const stats = useMemo(() => {
        const total = personas.length;
        const allGoals = personas.flatMap((p) => toArray(p.goals));
        const withFr = personas.filter((p) => toArray(p.frustrations).length > 0).length;
        const roles = new Map<string, number>();
        personas.forEach((p) => {
            const role = (p.role || "Unspecified").trim() || "Unspecified";
            roles.set(role, (roles.get(role) || 0) + 1);
        });
        const topRoles = Array.from(roles.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { total, allGoals: allGoals.length, avgGoals: total ? Math.round((allGoals.length / total) * 10) / 10 : 0, withFr, topRoles };
    }, [personas]);

    if (personas.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No personas yet.</p>
                <Link href={`/projects/${projectId}/personas/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate personas
                </Link>
            </div>
        );
    }

    const maxRole = Math.max(...stats.topRoles.map(([, c]) => c), 1);

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/personas`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} personas</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    {/* KPI cards */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Personas</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.allGoals}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Goals</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.avgGoals}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Avg / persona</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-[#FF4D00]">{stats.withFr}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">With frustrations</div>
                        </div>
                    </div>

                    {/* By role */}
                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By role</div>
                        <div className="mt-3 space-y-3">
                            {stats.topRoles.map(([role, count]) => (
                                <div key={role}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{role}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full border border-black bg-black/5">
                                        <div className="h-full bg-[#FF4D00]" style={{ width: `${(count / maxRole) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/personas`} className="nebula-btn nebula-btn--primary flex-1 justify-center">
                            View personas
                        </Link>
                        <Link href={`/projects/${projectId}/personas/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">
                            Generate more
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
