"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, LayoutGrid, List as ListIcon, Calendar, User, CheckCircle2, Circle, Trash2, Wand2, Clock, Loader2 } from "lucide-react";
import { createTask, updateTask, deleteTask, deleteAllTasks } from "@/actions/crud";
import { generateTasks } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { queryKeys } from "@/lib/query-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

const STATUS_COLS = [
    { id: "TODO", label: "To Do", color: "bg-[var(--color-ash)]" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-[var(--color-accent-blue)]" },
    { id: "DONE", label: "Done", color: "bg-[var(--color-accent-green)]" },
];

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "text-[color:var(--color-ash)] bg-[var(--color-surface-elevated)] border-[var(--color-nebula-hairline-strong)]",
    MEDIUM: "text-[color:var(--color-accent-yellow)] bg-[var(--color-surface-elevated)] border-[var(--color-nebula-hairline-strong)]",
    HIGH: "text-[color:var(--color-accent-red)] bg-[var(--color-accent-red-glow)] border-[var(--color-nebula-hairline-strong)]",
};

export default function TasksPage({ params, initialTasks, projectName }: { params: { id: string }; initialTasks: any[]; projectName: string }) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"board" | "list">("board");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assignee: "",
        dueDate: "",
    });

    const { data: tasks = initialTasks } = useQuery({
        queryKey: queryKeys.projects.tasks(params.id),
        queryFn: async () => initialTasks,
        initialData: initialTasks,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createTask(params.id, data),
        onSuccess: () => {
            toast.success("Task created");
            setIsModalOpen(false);
            setNewTask({ title: "", description: "", status: "TODO", priority: "MEDIUM", assignee: "", dueDate: "" });
            router.refresh();
        },
        onError: () => toast.error("Failed to create task"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateTask(vars.id, vars.data),
        onSuccess: () => {
            toast.success("Task updated");
            router.refresh();
        },
        onError: () => toast.error("Failed to update task"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            toast.success("Task deleted");
            setDeleteModalOpen(false);
            setTaskToDelete(null);
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

    const aiGenerateMutation = useMutation({
        mutationFn: (answers: Array<{ question: string; selected: string[] }>) => generateTasks(params.id, answers),
        onSuccess: async (result) => {
            if (result.success) {
                toast.success("Tasks generated");
                await queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(params.id) });
                setIsAIModalOpen(false);
                router.refresh();
            } else {
                toast.error("Failed to generate");
            }
        },
        onError: () => toast.error("Failed to generate tasks"),
    });

    const handleCreate = async () => {
        if (!newTask.title) return;
        await createMutation.mutateAsync({
            ...newTask,
            dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        });
    };

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

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        await updateMutation.mutateAsync({ id: taskId, data: { status: newStatus } });
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        await aiGenerateMutation.mutateAsync(answers);
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="nebula-hairline-b px-4 lg:px-6 py-4 bg-[var(--color-nebula-bg)]">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="text-center lg:text-left">
                                <Breadcrumb
                                    items={[
                                        { label: "Projects", href: "/dashboard" },
                                        { label: projectName, href: `/projects/${params.id}` },
                                        { label: "Tasks" },
                                    ]}
                                />
                                <h1 className="type-h3 mt-2">Tasks</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-end">
                                <div className="bg-[var(--color-nebula-surface)] p-1 rounded-[var(--r-md)] flex items-center">
                                    <button
                                        onClick={() => setViewMode("board")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "board" ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)]" : "text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]"}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-[var(--color-surface-elevated)] text-[color:var(--color-nebula-fg)]" : "text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]"}`}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <Button variant="nebula" onClick={() => setIsModalOpen(true)} className="text-sm px-4 py-2">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">New Task</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Toolbar */}
                <div className="px-4 lg:px-6 py-4 max-w-7xl mx-auto w-full">
                    <div className="flex gap-3">
                        <Button
                            variant="nebula-ghost"
                            onClick={() => setIsAIModalOpen(true)}
                            disabled={aiGenerateMutation.isPending}
                            className="transition-all duration-300"
                        >
                            {aiGenerateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Wand2 className="w-4 h-4 mr-2 text-[color:var(--color-nebula-fg)]" />
                            )}
                            {aiGenerateMutation.isPending ? "Generating..." : "Generate with AI"}
                        </Button>
                        {tasks.length > 0 && (
                            <Button
                                variant="nebula-ghost"
                                onClick={() => handleDelete("ALL")}
                                className="text-sm px-4 py-2 hover:bg-[var(--color-accent-red-glow)] hover:text-[color:var(--color-accent-red)] hover:border-[var(--color-accent-red)] border border-transparent"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Delete All</span>
                                <span className="sm:hidden">Clear</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                        {tasks.length === 0 ? (
                            <div className="flex items-center justify-center h-96">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[var(--color-nebula-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-[color:var(--color-ash)]" />
                                    </div>
                                    <h3 className="type-h4 mb-2">No Tasks Yet</h3>
                                    <p className="text-[color:var(--color-charcoal)]">Create your first task or let AI generate them</p>
                                </div>
                            </div>
                        ) : viewMode === "board" ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {STATUS_COLS.map((col) => (
                                    <div key={col.id} className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${col.color}`} />
                                            <h3 className="text-sm font-semibold text-[color:var(--color-nebula-fg)]">{col.label}</h3>
                                            <span className="text-xs text-[color:var(--color-ash)] bg-[var(--color-nebula-surface)] px-2 py-1 rounded-full">
                                                {tasks.filter((task: any) => task.status === col.id).length}
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {tasks
                                                .filter((task: any) => task.status === col.id)
                                                .map((task: any) => (
                                                    <GlassCard key={task.id} className="p-4 group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className={`text-[color:var(--color-nebula-fg)] font-medium ${task.status === "DONE" ? "line-through text-[color:var(--color-ash)]" : ""}`}>
                                                                {task.title}
                                                            </h4>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                                                {task.priority}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-[color:var(--color-charcoal)] mb-3">
                                                            {(() => {
                                                                try {
                                                                    const desc = task.description;
                                                                    if (typeof desc === 'string' && (desc.startsWith('{') || desc.startsWith('['))) {
                                                                        const parsed = JSON.parse(desc);
                                                                        if (Array.isArray(parsed)) {
                                                                            return (
                                                                                <ul className="list-disc list-inside space-y-0.5">
                                                                                    {parsed.map((item: any, i: number) => (
                                                                                        <li key={i}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            );
                                                                        }
                                                                        return typeof parsed === 'object' ? JSON.stringify(parsed) : desc;
                                                                    }
                                                                    return desc;
                                                                } catch {
                                                                    return task.description;
                                                                }
                                                            })()}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 text-xs text-[color:var(--color-ash)]">
                                                                {task.assignee && (
                                                                    <div className="flex items-center gap-1">
                                                                        <User className="w-3 h-3" />
                                                                        <span>{task.assignee}</span>
                                                                    </div>
                                                                )}
                                                                {task.dueDate && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => handleStatusChange(task.id, col.id === "TODO" ? "IN_PROGRESS" : col.id === "IN_PROGRESS" ? "DONE" : "TODO")}
                                                                    className="p-1 hover:bg-[var(--color-surface-elevated)] rounded transition-colors"
                                                                >
                                                                    {task.status === "DONE" ? <CheckCircle2 className="w-4 h-4 text-[color:var(--color-accent-green)]" /> : <Circle className="w-4 h-4" />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(task.id)}
                                                                    className="p-1 hover:bg-[var(--color-accent-red-glow)] rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-[color:var(--color-accent-red)]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </GlassCard>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map((task: any) => (
                                    <GlassCard key={task.id} className="p-4 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full bg-[var(--color-nebula-surface)] ${task.status === "DONE" ? "text-[color:var(--color-accent-green)]" :
                                                task.status === "IN_PROGRESS" ? "text-[color:var(--color-accent-blue)]" : "text-[color:var(--color-ash)]"
                                                }`}>
                                                {task.status === "DONE" ? <CheckCircle2 className="w-5 h-5" /> :
                                                    task.status === "IN_PROGRESS" ? <Clock className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className={`text-[color:var(--color-nebula-fg)] font-medium ${task.status === "DONE" ? "line-through text-[color:var(--color-ash)]" : ""}`}>
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-[color:var(--color-ash)] mt-1">
                                                    <span className={`px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                                        {task.priority}
                                                    </span>
                                                    {task.assignee && <span>{task.assignee}</span>}
                                                    {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                className="bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)] rounded text-xs text-[color:var(--color-nebula-fg)] p-1"
                                            >
                                                {STATUS_COLS.map(col => (
                                                    <option key={col.id} value={col.id}>{col.label}</option>
                                                ))}
                                            </select>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(task.id)}
                                                className="text-[color:var(--color-accent-red)] hover:bg-[var(--color-accent-red-glow)]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* New Task Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                            <DialogTitle className="type-h3 text-[color:var(--color-nebula-fg)] text-center">
                                New Task
                            </DialogTitle>
                        </DialogHeader>
                        <div className="px-6 py-5 space-y-5">
                            <div>
                                <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Task title"
                                />
                            </div>
                            <div>
                                <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="w-full h-24 bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] resize-none focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="Task description"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Status</label>
                                    <select
                                        value={newTask.status}
                                        onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        {STATUS_COLS.map(col => (
                                            <option key={col.id} value={col.id}>{col.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Assignee</label>
                                    <input
                                        type="text"
                                        value={newTask.assignee}
                                        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Due Date</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)]">
                            <div className="flex gap-3 justify-end w-full">
                                <Button variant="nebula-ghost" className="px-6" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} variant="nebula" className="px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                                    Create Task
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AIGenerationModal
                    isOpen={isAIModalOpen}
                    onClose={() => {
                        setIsAIModalOpen(false);
                        aiGenerateMutation.reset();
                    }}
                    projectId={params.id}
                    type="tasks"
                    onGenerate={handleAIGenerate}
                    isGenerating={aiGenerateMutation.isPending}
                />

                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={taskToDelete === "ALL" ? "Delete All Tasks" : "Delete Task"}
                    description={
                        taskToDelete === "ALL"
                            ? "Are you sure you want to delete ALL tasks? This action cannot be undone and will permanently remove everything from this list."
                            : "Are you sure you want to delete this task? This action cannot be undone."
                    }
                    confirmText={taskToDelete === "ALL" ? "Delete All" : "Delete Task"}
                />
            </div>
        </ProjectLayout>
    );
}