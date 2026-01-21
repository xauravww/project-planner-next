"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { CheckSquare } from "lucide-react";

const tasks = [
    { title: "Fix Auth Bug", priority: "Urgent", color: "text-red-400" },
    { title: "Design System", priority: "High", color: "text-orange-400" },
    { title: "User Interviews", priority: "Normal", color: "text-blue-400" },
    { title: "Update Docs", priority: "Low", color: "text-gray-400" },
];

export function TaskMatrix() {
    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CheckSquare className="text-purple-400" /> Task Matrix
                </h3>
                <span className="text-xs text-muted-foreground">4 Pending</span>
            </div>

            <div className="space-y-2">
                {tasks.map((task, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${task.color}`} />
                            <span className="text-sm text-gray-200 group-hover:text-white">{task.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{task.priority}</span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
