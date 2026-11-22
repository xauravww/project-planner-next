"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BusinessRuleMap({ projectId, rules }: { projectId: string; rules: any[] }) {
    const stats = useMemo(() => {
        const total = rules.length;
        const withCondition = rules.filter((r) => r.condition).length;
        const withAction = rules.filter((r) => r.action).length;
        return { total, withCondition, withAction };
    }, [rules]);

    if (rules.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-black/70">No business rules yet.</p>
                <Link href={`/projects/${projectId}/business-rules/generate`} className="nebula-btn nebula-btn--primary mt-6 justify-center">
                    Generate rules
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col bg-white">
            <div className="border-b-2 border-black px-3 py-2 md:px-4">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <Link href={`/projects/${projectId}/business-rules`} className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Link>
                    <span className="order-2 font-mono text-xs uppercase tracking-tight text-black/50">{stats.total} rules</span>
                </div>
            </div>

            <div className="flex-1 px-3 py-5 md:px-5">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.total}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">Rules</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-[#FF4D00]">{stats.withCondition}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">With condition</div>
                        </div>
                        <div className="border-2 border-black p-3">
                            <div className="font-display text-3xl leading-none text-black">{stats.withAction}</div>
                            <div className="mt-1.5 font-mono text-[10px] uppercase tracking-tight text-black/60">With action</div>
                        </div>
                    </div>

                    <div className="border-2 border-black p-4">
                        <div className="font-mono text-xs uppercase tracking-tight text-black/50">Rules</div>
                        <div className="mt-3 space-y-2">
                            {rules.map((r) => (
                                <div key={r.id} className="flex items-center justify-between gap-3 border-b border-black/10 pb-2 last:border-0 last:pb-0">
                                    <span className="font-medium text-black">{r.title}</span>
                                    <span className="font-mono text-[11px] uppercase tracking-tight text-black/50">{r.condition ? "condition" : "basic"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/projects/${projectId}/business-rules`} className="nebula-btn nebula-btn--primary flex-1 justify-center">View rules</Link>
                        <Link href={`/projects/${projectId}/business-rules/generate`} className="nebula-btn nebula-btn--ghost flex-1 justify-center">Generate more</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
