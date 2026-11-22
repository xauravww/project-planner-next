"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TeamMap({ projectId, members }: { projectId: string; members: any[] }) {
    const stats = useMemo(() => {
        const total = members.length;
        const roles = new Map<string, number>();
        members.forEach((m) => {
            const role = (m.role || "Unspecified").trim() || "Unspecified";
            roles.set(role, (roles.get(role) || 0) + 1);
        });
        return { total, roles: Array.from(roles.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6) };
    }, [members]);

    if (members.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No team members yet.</p>
                <Link href={`/projects/${projectId}/team/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">Generate team</Link>
            </div>
        );
    }

    const maxRole = Math.max(...stats.roles.map(([, c]) => c), 1);

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/team`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} members</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Members</div>
                        </div>
                    </div>

                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">By role</div>
                        <div className="mt-3 space-y-3">
                            {stats.roles.map(([role, count]) => (
                                <div key={role}>
                                    <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-tight text-black/70">
                                        <span>{role}</span><span>{count}</span>
                                    </div>
                                    <div className="mt-1 h-2 w-full border border-black bg-black/5">
                                        <div className="h-full bg-[#FF4D00]" style={{ width: `${(count / maxRole) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/team`} className="nebula-btn nebula-btn--primary flex-1 justify-center">View team</Link>
                        <Link href={`/projects/${projectId}/team/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">Generate more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
