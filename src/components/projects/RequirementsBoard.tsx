"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PRIORITY_ORDER = ["must-have", "should-have", "nice-to-have"];
const PRIORITY_LABEL: Record<string, string> = {
    "must-have": "Must have",
    "should-have": "Should have",
    "nice-to-have": "Nice to have",
};
const PRIORITY_ACCENT: Record<string, string> = {
    "must-have": "#FF4D00",
    "should-have": "#2563EB",
    "nice-to-have": "#16A34A",
};

function categoryOf(content: string): string | null {
    const m = content.match(/^Category:\s*(.+)$/m);
    return m ? m[1].trim() : null;
}

export default function RequirementsBoard({ projectId, requirements }: { projectId: string; requirements: any[] }) {
    const [groupBy, setGroupBy] = useState<"priority" | "category">("priority");

    const groups =
        groupBy === "priority"
            ? PRIORITY_ORDER.map((p) => ({
                  key: p,
                  label: PRIORITY_LABEL[p],
                  accent: PRIORITY_ACCENT[p],
                  items: requirements.filter((r) => r.priority === p),
              }))
            : Array.from(new Set(requirements.map((r) => categoryOf(r.content)).filter(Boolean) as string[])).map(
                  (c) => ({
                      key: c,
                      label: c,
                      accent: "#000",
                      items: requirements.filter((r) => categoryOf(r.content) === c),
                  }),
              );

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex items-center justify-between border-b-2 border-black px-4 py-3">
                <Link
                    href={`/projects/${projectId}/requirements`}
                    className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-tight text-black/60 transition-colors hover:text-[#FF4D00]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Link>
                <h1 className="type-h3">Requirements board</h1>
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-tight">
                    <span className="text-black/50">Group by</span>
                    <button
                        type="button"
                        onClick={() => setGroupBy("priority")}
                        className={`border-2 border-black px-3 py-1.5 transition-colors ${
                            groupBy === "priority" ? "bg-black text-white" : "text-black hover:bg-black/5"
                        }`}
                    >
                        Priority
                    </button>
                    <button
                        type="button"
                        onClick={() => setGroupBy("category")}
                        className={`border-2 border-black px-3 py-1.5 transition-colors ${
                            groupBy === "category" ? "bg-black text-white" : "text-black hover:bg-black/5"
                        }`}
                    >
                        Category
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="flex min-w-max gap-4">
                    {groups.map((g) => (
                        <div key={g.key} className="flex w-72 shrink-0 flex-col border-2 border-black bg-black/5">
                            <div className="flex items-center justify-between border-b-2 border-black bg-white px-4 py-2.5">
                                <span className="font-semibold text-black">{g.label}</span>
                                <span
                                    className="font-mono text-xs font-bold"
                                    style={{ color: g.accent }}
                                >
                                    {g.items.length}
                                </span>
                            </div>
                            <div className="flex-1 space-y-3 p-3">
                                {g.items.length === 0 && (
                                    <p className="text-center text-sm text-black/40">Empty</p>
                                )}
                                {g.items.map((r) => (
                                    <div key={r.id} className="border-2 border-black bg-white p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-black">{r.title}</p>
                                            <span className="h-2 w-2 shrink-0" style={{ background: g.accent }} />
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-black/70">
                                            {typeof r.content === "string" ? r.content.replace(/^Category:.*\n?/, "") : ""}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            <span className="border border-black px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tight text-black/70">
                                                {r.type === "functional" ? "Functional" : "Non-functional"}
                                            </span>
                                            {categoryOf(r.content) && (
                                                <span className="border border-black px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-tight text-[#FF4D00]">
                                                    {categoryOf(r.content)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
