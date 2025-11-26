"use client";

import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { clearStaleStatus } from "@/actions/crud";
import { toast } from "sonner";

interface StaleModuleBannerProps {
    projectId: string;
    module: string;
    reason: string;
    changedModule: string;
    updatedAt: string;
    onRegenerate: () => void;
}

export function StaleModuleBanner({
    projectId,
    module,
    reason,
    changedModule,
    updatedAt,
    onRegenerate
}: StaleModuleBannerProps) {
    const [dismissed, setDismissed] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    if (dismissed) return null;

    const handleDismiss = async () => {
        setIsDismissing(true);
        const result = await clearStaleStatus(projectId, module);
        if (result.error) {
            toast.error("Failed to dismiss notification");
            setIsDismissing(false);
        } else {
            setDismissed(true);
            toast.success("Notification dismissed");
        }
    };

    const formatModuleName = (name: string) => {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    return (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <h3 className="font-semibold text-yellow-400 mb-1">
                    Content May Be Outdated
                </h3>
                <p className="text-sm text-gray-300">
                    The <strong>{formatModuleName(changedModule)}</strong> has been updated.
                    This content may no longer reflect the latest project state.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(updatedAt).toLocaleString()}
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onRegenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded text-sm transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                </button>
                <button
                    onClick={handleDismiss}
                    disabled={isDismissing}
                    className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
