"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Scale, Trash2, Pencil, Wand2 } from "lucide-react";
import { deleteBusinessRule, deleteAllBusinessRules } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

export default function BusinessRulesPage({ params, initialRules, projectName }: { params: { id: string }; initialRules: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: rules = initialRules } = useQuery({
        queryKey: queryKeys.projects.businessRules(params.id),
        queryFn: async () => initialRules,
        initialData: initialRules,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteBusinessRule(id),
        onSuccess: () => {
            toast.success("Rule deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete rule"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllBusinessRules(projectId),
        onSuccess: () => {
            toast.success("All rules deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.businessRules(params.id) });
            router.refresh();
        },
        onError: () => toast.error("Failed to delete all rules"),
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setRuleToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (ruleToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setRuleToDelete(null);
        } else if (ruleToDelete) {
            await deleteMutation.mutateAsync(ruleToDelete);
            setDeleteModalOpen(false);
            setRuleToDelete(null);
        }
    };

    const handleEdit = (rule: any) => {
        router.push(`/projects/${params.id}/business-rules/new?edit=${rule.id}`);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col bg-white">
                <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h1 className="type-h3">Business Rules</h1>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            <Link href={`/projects/${params.id}/business-rules/new`} className="nebula-btn nebula-btn--primary justify-center">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add rule</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                            <Link href={`/projects/${params.id}/business-rules/board`} className="nebula-btn nebula-btn--ghost justify-center">
                                Overview
                            </Link>
                            <Link href={`/projects/${params.id}/business-rules/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                                Connections
                            </Link>
                            <Button variant="nebula-ghost" onClick={() => router.push(`/projects/${params.id}/business-rules/generate`)} className="transition-all duration-300 text-sm px-4 py-2">
                                <Wand2 className="h-4 w-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                <span className="hidden sm:inline">Generate with AI</span>
                                <span className="sm:hidden">AI Generate</span>
                            </Button>
                            {rules.length > 0 && (
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
                    {rules.length === 0 ? (
                        <div className="flex items-center justify-center px-4 py-16">
                            <div className="max-w-md text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                    <Scale className="h-10 w-10 text-[#FF4D00]" />
                                </div>
                                <h3 className="type-h3 mt-6">No business rules yet</h3>
                                <p className="mt-3 text-black/60">
                                    Generate rules with AI or add them manually using the buttons above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                            {rules.map((rule: any) => (
                                <div key={rule.id} className="border-2 border-black bg-white p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-black">{rule.title}</h3>
                                            <p className="mt-2 text-sm text-black/70">{rule.description}</p>
                                            {(rule.condition || rule.action) && (
                                                <div className="mt-3 flex flex-wrap gap-3">
                                                    {rule.condition && (
                                                        <div className="border-2 border-black p-2">
                                                            <p className="font-mono text-[10px] uppercase tracking-tight text-black/50">Condition</p>
                                                            <p className="mt-1 text-sm text-black/70">{rule.condition}</p>
                                                        </div>
                                                    )}
                                                    {rule.action && (
                                                        <div className="border-2 border-black bg-black p-2 text-white">
                                                            <p className="font-mono text-[10px] uppercase tracking-tight text-white/60">Action</p>
                                                            <p className="mt-1 text-sm text-white/80">{rule.action}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <button onClick={() => handleEdit(rule)} aria-label="Edit rule" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(rule.id)} aria-label="Delete rule" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={ruleToDelete === "ALL" ? "Delete All Rules" : "Delete Rule"}
                    description={ruleToDelete === "ALL" ? "Are you sure you want to delete ALL rules? This action cannot be undone." : "Are you sure you want to delete this rule? This action cannot be undone."}
                    confirmText={ruleToDelete === "ALL" ? "Delete All" : "Delete Rule"}
                />
            </div>
        </ProjectLayout>
    );
}
