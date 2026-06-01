"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { DeleteModal } from "@/components/ui/DeleteModal";
import { Plus, Users, Trash2, Pencil, Mail, Shield } from "lucide-react";
import { createMember, updateMember, deleteMember, deleteAllMembers } from "@/actions/crud";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { queryKeys } from "@/lib/query-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

interface Member {
    id: string;
    name: string;
    role: string;
    email: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export default function TeamPage({ params, initialMembers, projectName }: { params: { id: string }; initialMembers: Member[]; projectName: string }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
    });

    const { data: members = initialMembers, refetch } = useQuery<Member[]>({
        queryKey: queryKeys.projects.team(params.id),
        queryFn: async () => {
            const res = await fetch(`/api/projects/${params.id}/team`);
            if (!res.ok) throw new Error("Failed to fetch team members");
            return res.json();
        },
        initialData: initialMembers,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createMember(params.id, data),
        onSuccess: async () => {
            toast.success("Team member added");
            setIsModalOpen(false);
            setFormData({ name: "", role: "", email: "" });
            await refetch();
        },
        onError: () => toast.error("Failed to add member"),
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: any }) => updateMember(vars.id, vars.data),
        onSuccess: async () => {
            toast.success("Team member updated");
            setEditingId(null);
            setFormData({ name: "", role: "", email: "" });
            setIsModalOpen(false);
            await refetch();
        },
        onError: () => toast.error("Failed to update member"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteMember(id),
        onSuccess: async () => {
            toast.success("Team member removed");
            setDeleteModalOpen(false);
            setMemberToDelete(null);
            await refetch();
        },
        onError: () => toast.error("Failed to remove member"),
    });

    const deleteAllMutation = useMutation({
        mutationFn: (projectId: string) => deleteAllMembers(projectId),
        onSuccess: async () => {
            toast.success("All team members removed");
            await refetch();
        },
        onError: () => toast.error("Failed to remove all members"),
    });

    const handleCreate = async () => {
        if (!formData.name || !formData.email) return;
        await createMutation.mutateAsync(formData);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateMutation.mutateAsync({ id: editingId, data: formData });
    };

    const handleEdit = (member: any) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            role: member.role,
            email: member.email,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        setMemberToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (memberToDelete === "ALL") {
            await deleteAllMutation.mutateAsync(params.id);
            setDeleteModalOpen(false);
            setMemberToDelete(null);
        } else if (memberToDelete) {
            await deleteMutation.mutateAsync(memberToDelete);
            setDeleteModalOpen(false);
            setMemberToDelete(null);
        }
    };

    return (
        <>
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
                                            { label: "Team Members" },
                                        ]}
                                    />
                                    <h1 className="type-h3 mt-2">Team Members</h1>
                                </div>
                                <div className="flex gap-3 justify-center lg:justify-end">
                                    {members.length > 0 && (
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
                                    <Button variant="nebula" onClick={() => {
                                        setEditingId(null);
                                        setFormData({ name: "", role: "", email: "" });
                                        setIsModalOpen(true);
                                    }} className="transition-all text-sm px-4 py-2">
                                        <Plus className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Add Member</span>
                                        <span className="sm:hidden">Add</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto">
                        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
                            {members.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 bg-[var(--color-nebula-surface)] rounded-[var(--r-lg)] flex items-center justify-center mb-6">
                                        <Users className="w-10 h-10 text-[color:var(--color-ash)]" />
                                    </div>
                                    <h3 className="type-h4 mb-2">No Team Members</h3>
                                    <p className="text-[color:var(--color-charcoal)] max-w-md mb-6">
                                        Add team members to collaborate on this project.
                                    </p>
                                    <Button onClick={() => setIsModalOpen(true)} size="lg" variant="nebula" className="transition-all">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add First Member
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {members.map((member) => (
                                        <GlassCard key={member.id} className="p-6 relative group flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-nebula-hairline-strong)] flex items-center justify-center text-xl font-bold text-[color:var(--color-nebula-fg)]">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-[color:var(--color-nebula-fg)] font-medium truncate">{member.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-[color:var(--color-charcoal)] mt-0.5">
                                                    <Shield className="w-3 h-3" />
                                                    <span>{member.role}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-[color:var(--color-ash)] mt-0.5 truncate">
                                                    <Mail className="w-3 h-3" />
                                                    <span>{member.email}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(member)} className="p-2 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-nebula-surface)] rounded-[var(--r-md)] text-[color:var(--color-nebula-fg)]">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(member.id)} className="p-2 bg-[var(--color-accent-red-glow)] hover:bg-[var(--color-accent-red-glow)] rounded-[var(--r-md)] text-[color:var(--color-accent-red)]">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Create/Edit Modal */}
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader className="px-6 py-5 relative z-10 border-b border-[var(--color-nebula-hairline-strong)]">
                                    <DialogTitle className="type-h3 text-[color:var(--color-nebula-fg)] text-center">
                                        {editingId ? "Edit Member" : "Add Team Member"}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="px-6 py-5 space-y-5">
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="type-small text-[color:var(--color-charcoal)] mb-1 block">Role</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-white/5 border border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-md)] px-3 py-2 text-[color:var(--color-nebula-fg)] focus:outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g. Developer"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="px-6 py-5 border-t border-[var(--color-nebula-hairline-strong)]">
                                    <div className="flex gap-3 justify-end w-full">
                                        <Button variant="nebula-ghost" className="px-6" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                        <Button onClick={editingId ? handleUpdate : handleCreate} variant="nebula" className="px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                                            {editingId ? "Save Changes" : "Add Member"}
                                        </Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <DeleteModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={memberToDelete === "ALL" ? "Remove All Team Members" : "Remove Team Member"}
                    description={
                        memberToDelete === "ALL"
                            ? "Are you sure you want to remove ALL members from the team? This action cannot be undone."
                            : "Are you sure you want to remove this member from the team?"
                    }
                    confirmText={memberToDelete === "ALL" ? "Remove All" : "Remove Member"}
                />
            </ProjectLayout>
        </>
    );
}