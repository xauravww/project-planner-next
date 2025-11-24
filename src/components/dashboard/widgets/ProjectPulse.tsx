"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Activity } from "lucide-react";

export function ProjectPulse() {
    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="text-blue-400" /> Project Pulse
                </h3>
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Healthy</span>
            </div>

            <div className="flex-1 flex items-end justify-between gap-1 px-2">
                {[40, 70, 30, 85, 50, 65, 90, 45, 60, 75, 55, 80].map((h, i) => (
                    <div
                        key={i}
                        className="w-full bg-gradient-to-t from-blue-600/20 to-purple-600/50 rounded-t-sm hover:from-blue-600/40 hover:to-purple-600/70 transition-colors cursor-pointer"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>12 AM</span>
                <span>12 PM</span>
            </div>
        </GlassCard>
    );
}
