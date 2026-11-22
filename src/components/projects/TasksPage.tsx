"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, ListTodo, Trash2, Pencil, Wand2 } from "lucide-react";
import { deleteTask, deleteAllTasks } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import { queryKeys } from "@/lib/query-client";
import { DeleteModal } from "@/components/ui/DeleteModal";

const PRIORITY_STYLE: Record<string, string> = {
    HIGH: "bg-black text-white",
    MEDIUM: "text-[#FF4D00]",
    LOW: "text-black/70",
};
const STATUS_LABEL: Record<string, string> = {
    TODO: "To do",
    IN_PROGRESS: "In progress",
    DONE: "Done",
};

export default function TasksPage({ params, initialTasks, projectName }: { params: { id: string }; initialTasks: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: tasks = initialTasks } = useQuery({
        queryKey: queryKeys.projects.tasks(params.id),
        queryFn: async () => initialTasks,
        initialData: initialTasks,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            toast.success("Task deleted");
            router.refresh();
        },
        onError: () => toast.error("Failed to delete task"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllTasks(projectId),
        onSuccess: () => {
            toast.success("All tasks deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(params.id) });
            router.refresh();
        },
        onError: () => toast.error("Failed to delete all tasks"),
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setTaskToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setTaskToDelete(null);
        } else if (taskToDelete) {
            await deleteMutation.mutateAsync(taskToDelete);
            setDeleteModalOpen(false);
            setTaskToDelete(null);
        }
    };

    const handleEdit = (task: any) => {
        router.push(`/projects/${params.id}/tasks/new?edit=${task.id}`);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col bg-white">
                <div className="border-b-2 border-black bg-white px-4 lg:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <h1 className="type-h3">Tasks</h1>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                            <Link href={`/projects/${params.id}/tasks/new`} className="nebula-btn nebula-btn--primary justify-center">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add task</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                            <Link href={`/projects/${params.id}/tasks/board`} className="nebula-btn nebula-btn--ghost justify-center">
                                Overview
                            </Link>
                            <Link href={`/projects/${params.id}/tasks/connections`} className="nebula-btn nebula-btn--ghost justify-center">
                                Connections
                            </Link>
                            <Button variant="nebula-ghost" onClick={() => router.push(`/projects/${params.id}/tasks/generate`)} className="transition-all duration-300 text-sm px-4 py-2">
                                <Wand2 className="h-4 w-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                                <span className="hidden sm:inline">Generate with AI</span>
                                <span className="sm:hidden">AI Generate</span>
                            </Button>
                            {tasks.length > 0 && (
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
                    {tasks.length === 0 ? (
                        <div className="flex items-center justify-center px-4 py-16">
                            <div className="max-w-md text-center">
                                <div className="mx-auto grid h-20 w-20 place-items-center border-2 border-black">
                                    <ListTodo className="h-10 w-10 text-[#FF4D00]" />
                                </div>
                                <h3 className="type-h3 mt-6">No tasks yet</h3>
                                <p className="mt-3 text-black/60">
                                    Generate tasks with AI or add them manually using the buttons above.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-3">
                            {tasks.map((task: any) => {
                                const priority = (task.priority || "MEDIUM").toUpperCase();
                                const status = (task.status || "TODO").toUpperCase();
                                return (
                                    <div key={task.id} className="border-2 border-black bg-white p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-semibold text-black">{task.title}</h3>
                                                    <span className={`border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight ${PRIORITY_STYLE[priority] || "text-black/70"}`}>
                                                        {priority}
                                                    </span>
                                                    <span className="border-2 border-black px-2 py-0.5 font-mono text-[11px] uppercase tracking-tight text-black/70">
                                                        {STATUS_LABEL[status] || status}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="mt-2 text-sm text-black/70">{task.description}</p>
                                                )}
                                                {task.assignee && (
                                                    <p className="mt-2 font-mono text-[11px] uppercase tracking-tight text-black/50">Assignee: {task.assignee}</p>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 gap-2">
                                                <button onClick={() => handleEdit(task)} aria-label="Edit task" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(task.id)} aria-label="Delete task" className="grid h-9 w-9 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={taskToDelete === "ALL" ? "Delete All Tasks" : "Delete Task"}
                    description={taskToDelete === "ALL" ? "Are you sure you want to delete ALL tasks? This action cannot be undone." : "Are you sure you want to delete this task? This action cannot be undone."}
                    confirmText={taskToDelete === "ALL" ? "Delete All" : "Delete Task"}
                />
            </div>
        </ProjectLayout>
    );
}
