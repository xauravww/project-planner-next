import { motion } from "framer-motion";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ReadinessValues {
    hasIdea: boolean;
    hasAudience: boolean;
    hasFeatures: boolean;
    hasGoal: boolean;
}

interface ProjectReadinessProps {
    values: ReadinessValues;
}

export function ProjectReadiness({ values }: ProjectReadinessProps) {
    const total = 4;
    const completed = Object.values(values).filter(Boolean).length;
    const progress = (completed / total) * 100;

    const items = [
        { label: "Core Concept", key: "hasIdea", desc: "What are you building?" },
        { label: "Target Audience", key: "hasAudience", desc: "Who is it for?" },
        { label: "Key Features", key: "hasFeatures", desc: "What does it do?" },
        { label: "Primary Goal", key: "hasGoal", desc: "Why build it?" },
    ];

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">Blueprint Readiness</span>
                <span className={`text-sm font-bold ${progress === 100 ? "text-green-400" : "text-blue-400"}`}>
                    {Math.round(progress)}%
                </span>
            </div>

            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${progress === 100 ? "bg-green-500" : "bg-blue-500"}`}
                />
            </div>

            <div className="space-y-3 pt-2">
                {items.map((item) => {
                    const isDone = values[item.key as keyof ReadinessValues];
                    return (
                        <div key={item.key} className="flex items-start gap-3">
                            {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                            ) : (
                                <Circle className="w-5 h-5 text-zinc-600 mt-0.5 shrink-0" />
                            )}
                            <div>
                                <p className={`text-sm font-medium ${isDone ? "text-zinc-200" : "text-zinc-500"}`}>
                                    {item.label}
                                </p>
                                <p className="text-xs text-zinc-600">{item.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {progress < 100 && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-200">
                        Continue chatting or use "Guide Me" to complete your blueprint.
                    </p>
                </div>
            )}
        </div>
    );
}
