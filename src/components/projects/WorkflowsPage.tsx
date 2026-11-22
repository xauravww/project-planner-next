"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Pencil, Trash2, Wand2, Workflow } from "lucide-react";
import { deleteWorkflow, deleteAllWorkflows } from "@/actions/crud";
import { MessageContent } from "@/components/chat/MessageContent";
import CanvasViewer from "@/components/ui/CanvasViewer";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

const renderSteps = (contentJson: any) => {
    let steps: string[] = [];
    let raw: string | null = null;
    if (typeof contentJson === "string") {
        try {
            const parsed = JSON.parse(contentJson);
            if (Array.isArray(parsed)) steps = parsed.map(String);
            else if (parsed.steps && Array.isArray(parsed.steps)) steps = parsed.steps.map(String);
            else raw = contentJson;
        } catch {
            raw = contentJson;
        }
    } else if (Array.isArray(contentJson)) {
        steps = contentJson.map(String);
    } else if (contentJson?.steps && Array.isArray(contentJson.steps)) {
        steps = contentJson.steps.map(String);
    } else {
        raw = String(contentJson ?? "");
    }

    if (steps.length === 0 && raw) steps = raw.split("\n").map((s) => s.trim()).filter(Boolean);

    if (steps.length === 0) return null;
    return (
        <ol className="space-y-1.5">
            {steps.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-black/70">
                    <span className="font-mono text-[#FF4D00]">{i + 1}.</span>
                    <span>{s}</span>
                </li>
            ))}
        </ol>
    );
};

export default function WorkflowsPageClient({
    project,
    initialWorkflows,
}: {
    project: any;
    initialWorkflows: any[];
}) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: workflows = initialWorkflows, refetch } = useQuery({
        queryKey: queryKeys.projects.workflows(project.id),
        queryFn: async () => {
            const res = await fetch(`/api/projects/${project.id}/workflows`);
            if (!res.ok) throw new Error("Failed to fetch workflows");
            return res.json();
        },
        initialData: initialWorkflows,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteWorkflow(id),
        onSuccess: async () => {
            toast.success("Workflow deleted");
            await refetch();
        },
        onError: () => toast.error("Failed to delete workflow"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllWorkflows(projectId),
        onSuccess: async () => {
            toast.success("All workflows deleted");
            await refetch();
        },
        onError: () => toast.error("Failed to delete all workflows"),
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setWorkflowToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (workflowToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(project.id);
            setDeleteModalOpen(false);
            setWorkflowToDelete(null);
        } else if (workflowToDelete) {
            await deleteMutation.mutateAsync(workflowToDelete);
            setDeleteModalOpen(false);
            setWorkflowToDelete(null);
        }
    };

    const handleEdit = (wf: any) => {
        router.push(`/projects/${project.id}/workflows/new?edit=${wf.id}`);
    };

    const handleGenerateClick = () => {
        router.push(`/projects/${project.id}/workflows/generate`);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="type-h3">Workflows</h1>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                        <Link href={`/projects/${project.id}/workflows/new`} className="nebula-btn nebula-btn--primary justify-center">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add workflow</span>
                            <span className="sm:hidden">Add</span>
                        </Link>
                        <Link href={`/projects/${project.id}/workflows/board`} className="nebula-btn nebula-btn--ghost justify-center">
                            Overview
                        </Link>
                        <Link href={`/projects/${project.id}/workflows/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                            Connections
                        </Link>
                        <Button
                            variant="nebula-ghost"
                            onClick={handleGenerateClick}
                            className="transition-all duration-300 text-sm px-4 py-2"
                        >
                            <Wand2 className="h-4 w-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                            <span className="hidden sm:inline">Generate with AI</span>
                            <span className="sm:hidden">AI Generate</span>
                        </Button>
                        {workflows.length > 0 && (
                            <button
                                type="button"
                                onClick={() => handleDelete("ALL")}
                                className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 font-mono text-xs uppercase tracking-tight text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden sm:inline">Delete all</span>
                                <span className="sm:hidden">Clear</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {workflows.length === 0 ? (
                    <div className="flex items-center justify-center px-4 py-16">
                        <div className="max-w-md text-center">
                            <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                <Workflow className="h-10 w-10 text-[#FF4D00]" />
                            </div>
                            <h3 className="type-h3 mt-6">No workflows yet</h3>
                            <p className="mt-3 text-black/60">
                                Generate workflows with AI or add them manually using the buttons above.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
                        {workflows.map((wf: any) => (
                            <div key={wf.id} className="border-2 border-black bg-white p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-semibold text-black">{wf.title}</h3>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => handleEdit(wf)}
                                            aria-label="Edit workflow"
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(wf.id)}
                                            aria-label="Delete workflow"
                                            className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="mb-2 font-mono text-[11px] uppercase tracking-tight text-black/50">Steps</p>
                                    {renderSteps(wf.content)}
                                </div>

                                {wf.diagram && (
                                    <div className="mt-5 border-t-2 border-black pt-4">
                                        <p className="mb-3 font-mono text-[11px] uppercase tracking-tight text-black/50">Flow diagram</p>
                                        <div className="h-[360px] border-2 border-black">
                                            <CanvasViewer>
                                                <div className="p-4">
                                                    <MessageContent content={`\`\`\`mermaid\n${wf.diagram}\n\`\`\``} />
                                                </div>
                                            </CanvasViewer>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={workflowToDelete === "ALL" ? "Delete All Workflows" : "Delete Workflow"}
                description={
                    workflowToDelete === "ALL"
                        ? "Are you sure you want to delete ALL workflows? This action cannot be undone."
                        : "Are you sure you want to delete this workflow? This action cannot be undone."
                }
                confirmText={workflowToDelete === "ALL" ? "Delete All" : "Delete Workflow"}
            />
        </div>
    );
}
