"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Activity } from "lucide-react";

export function ProjectPulse() {
    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="type-h4 text-[color:var(--color-nebula-fg)] flex items-center gap-2">
                    <Activity className="text-[color:var(--color-accent-orange)]" /> Project Pulse
                </h3>
                <span className="type-caption text-[color:var(--color-accent-green)] bg-[var(--color-accent-green-glow)] px-2 py-1 rounded-full">Healthy</span>
            </div>

            <div className="flex-1 flex items-end justify-between gap-1 px-2">
                {[40, 70, 30, 85, 50, 65, 90, 45, 60, 75, 55, 80].map((h, i) => (
                    <div
                        key={i}
                        className="w-full bg-gradient-to-t from-[var(--color-accent-orange-glow)] to-[var(--color-accent-orange)]/40 rounded-t-sm hover:from-[var(--color-accent-orange-glow)] hover:to-[var(--color-accent-orange)]/70 transition-colors cursor-pointer"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-2 type-caption text-[color:var(--color-ash)]">
                <span>12 AM</span>
                <span>12 PM</span>
            </div>
        </GlassCard>
    );
}