"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Users } from "lucide-react";

const team = [
    { initial: "JD", color: "bg-blue-500" },
    { initial: "AS", color: "bg-purple-500" },
    { initial: "MK", color: "bg-green-500" },
    { initial: "RL", color: "bg-red-500" },
];

export function TeamOrbit() {
    return (
        <GlassCard className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="text-pink-400" /> Team Orbit
                </h3>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
                {/* Orbit Rings */}
                <div className="absolute inset-0 m-auto w-32 h-32 rounded-full border border-white/5 animate-spin-slow" />
                <div className="absolute inset-0 m-auto w-48 h-48 rounded-full border border-white/5 animate-spin-reverse-slow" />

                {/* Center Hub */}
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 z-10">
                    <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                </div>

                {/* Members */}
                {team.map((member, i) => {
                    const angle = (i * 360) / team.length;
                    const radius = 80; // px
                    const x = Math.cos((angle * Math.PI) / 180) * radius;
                    const y = Math.sin((angle * Math.PI) / 180) * radius;

                    return (
                        <div
                            key={i}
                            className={`absolute w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-xs font-bold text-white border-2 border-black/50`}
                            style={{ transform: `translate(${x}px, ${y}px)` }}
                        >
                            {member.initial}
                        </div>
                    );
                })}
            </div>
        </GlassCard>
    );
}
