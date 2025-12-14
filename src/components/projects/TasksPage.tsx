"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, LayoutGrid, List as ListIcon, Calendar, User, MoreHorizontal, Trash2, CheckCircle2, Circle, Clock, Wand2 } from "lucide-react";
import { createTask, updateTask, deleteTask } from "@/actions/crud";
import { generateTasks } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

const STATUS_COLS = [
    { id: "TODO", label: "To Do", color: "bg-gray-500" },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
    { id: "DONE", label: "Done", color: "bg-green-500" },
];

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "text-gray-400 bg-gray-500/10 border-gray-500/20",
    MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    HIGH: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function TasksPage({ params, tasks, projectName }: { params: { id: string }; tasks: any[]; projectName: string }) {
    const [viewMode, setViewMode] = useState<"board" | "list">("board");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assignee: "",
        dueDate: "",
    });

    const handleCreate = async () => {
        if (!newTask.title) return;
        await createTask(params.id, {
            ...newTask,
            dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        });
        setIsModalOpen(false);
        setNewTask({ title: "", description: "", status: "TODO", priority: "MEDIUM", assignee: "", dueDate: "" });
        window.location.reload();
    };

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        setTaskToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (taskToDelete) {
            await deleteTask(taskToDelete);
            setDeleteModalOpen(false);
            setTaskToDelete(null);
            window.location.reload();
        }
    };

    const handleAIGenerate = async (answers: Array<{ question: string; selected: string[] }>) => {
        setIsGenerating(true);
        await generateTasks(params.id, answers);
        setIsGenerating(false);
        window.location.reload();
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        await updateTask(id, { status: newStatus });
        window.location.reload();
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b border-white/10 px-4 lg:px-6 py-4 bg-black/20">
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
                                <h1 className="text-xl lg:text-2xl font-semibold text-white mt-2">Tasks</h1>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-end">
                                <div className="bg-white/5 p-1 rounded-lg flex items-center">
                                    <button
                                        onClick={() => setViewMode("board")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "board" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <Button onClick={() => setIsModalOpen(true)} className="bg-white text-black hover:bg-gray-200 text-sm px-4 py-2">
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">New Task</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                 </div>

                <div className="px-4 lg:px-6 py-4">
                    <Button
                        onClick={() => setIsAIModalOpen(true)}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {isGenerating ? "Generating..." : "Generate with AI"}
                    </Button>
                </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
                    {viewMode === "board" ? (
                        <div className="flex gap-6 h-full min-w-[1000px]">
                            {STATUS_COLS.map((col) => (
                                <div key={col.id} className="flex-1 min-w-[300px] flex flex-col">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${col.color}`} />
                                            <h3 className="font-medium text-white">{col.label}</h3>
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                                {tasks.filter((t) => t.status === col.id).length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-xl p-3 space-y-3 overflow-y-auto">
                                        {tasks
                                            .filter((t) => t.status === col.id)
                                            .map((task) => (
                                                <GlassCard key={task.id} className="p-4 hover:border-white/20 transition-colors group cursor-grab active:cursor-grabbing">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                                            {task.priority}
                                                        </span>
                                                        <button
                                                            onClick={() => handleDelete(task.id)}
                                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <h4 className="text-white font-medium mb-1">{task.title}</h4>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{task.description}</p>
                                                    )}
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-white/5">
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
                 ) : (
                     <div className="space-y-4">
                         {tasks.map((task) => (
                             <GlassCard key={task.id} className="p-4">
                                 <div className="flex justify-between items-start mb-2">
                                     <h4 className="text-white font-medium">{task.title}</h4>
                                     <span className={`text-[10px] px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                         {task.priority}
                                     </span>
                                 </div>
                                 {task.description && (
                                     <p className="text-xs text-gray-400 mb-3">{task.description}</p>
                                 )}
                                 <div className="flex items-center justify-between text-xs text-gray-500">
                                     <span className={`px-2 py-1 rounded ${STATUS_COLS.find(col => col.id === task.status)?.color} text-white`}>
                                         {STATUS_COLS.find(col => col.id === task.status)?.label}
                                     </span>
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
                             </GlassCard>
                         ))}
                     </div>
                 )}
                    </div>

                                                    {/* Quick status change for demo */}
                                                    <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {STATUS_COLS.filter(c => c.id !== task.status).map(c => (
                                                            <button
                                                                key={c.id}
                                                                onClick={() => handleStatusChange(task.id, c.id)}
                                                                className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-gray-300"
                                                            >
                                                                Move to {c.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </GlassCard>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <GlassCard key={task.id} className="p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full bg-white/5 ${task.status === "DONE" ? "text-green-400" :
                                            task.status === "IN_PROGRESS" ? "text-blue-400" : "text-gray-400"
                                            }`}>
                                            {task.status === "DONE" ? <CheckCircle2 className="w-5 h-5" /> :
                                                task.status === "IN_PROGRESS" ? <Clock className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h4 className={`text-white font-medium ${task.status === "DONE" ? "line-through text-gray-500" : ""}`}>
                                                {task.title}
                                            </h4>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
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
                                            className="bg-black/40 border border-white/10 rounded text-xs text-white p-1"
                                        >
                                            {STATUS_COLS.map(col => (
                                                <option key={col.id} value={col.id}>{col.label}</option>
                                            ))}
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(task.id)}
                                            className="text-red-400 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Task Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">New Task</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Task title"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        className="w-full h-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Task description"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Status</label>
                                        <select
                                            value={newTask.status}
                                            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            {STATUS_COLS.map(col => (
                                                <option key={col.id} value={col.id}>{col.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Assignee</label>
                                        <input
                                            type="text"
                                            value={newTask.assignee}
                                            onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400 mb-1 block">Due Date</label>
                                        <input
                                            type="date"
                                            value={newTask.dueDate}
                                            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">Create Task</Button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
                    </div>
                </div>
            <AIGenerationModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                projectId={params.id}
                type="tasks"
                onGenerate={handleAIGenerate}
            />

            <DeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Task"
                description="Are you sure you want to delete this task? This action cannot be undone."
                confirmText="Delete Task"
            />
        </ProjectLayout>
    );
}
