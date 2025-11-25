```
"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Plus, Users, Trash2, Pencil, Mail, User, Wand2 } from "lucide-react";
import { createMember, updateMember, deleteMember } from "@/actions/crud";
import { generateTeamMembers } from "@/actions/project";
import { AIGenerationModal } from "./AIGenerationModal";
import ProjectLayout from "@/components/projects/ProjectLayout";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function TeamPage({ params, members, projectName }: { params: { id: string }; members: any[]; projectName: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        email: "",
    });

    const handleCreate = async () => {
        if (!formData.name || !formData.email) return;
        await createMember(params.id, formData);
        setIsModalOpen(false);
        setFormData({ name: "", role: "", email: "" });
        window.location.reload();
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        await updateMember(editingId, formData);
        setEditingId(null);
        setFormData({ name: "", role: "", email: "" });
        window.location.reload();
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

    const handleDelete = async (id: string) => {
        if (confirm("Remove this member from the team?")) {
            await deleteMember(id);
            window.location.reload();
        }
    };

    return (
        <ProjectLayout projectId={params.id} projectName={projectName}>
            <div className="h-full flex flex-col">
                <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/20">
                    <div>
                        <Breadcrumb
                            items={[
                                { label: "Projects", href: "/dashboard" },
                                { label: projectName, href: `/ projects / ${ params.id } ` },
                                { label: "Team" },
                            ]}
                        />
                        <h1 className="text-2xl font-semibold text-white mt-2">Team Members</h1>
                    </div>
                    <Button onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", role: "", email: "" });
                        setIsModalOpen(true);
                    }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Member
                    </Button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">No Team Members</h3>
                            <p className="text-gray-400 max-w-md mb-6">
                                Add team members to collaborate on this project.
                            </p>
                            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-5 h-5 mr-2" />
                                Add First Member
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map((member) => (
                                <GlassCard key={member.id} className="p-6 relative group flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-medium truncate">{member.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5">
                                            <Shield className="w-3 h-3" />
                                            <span>{member.role}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5 truncate">
                                            <Mail className="w-3 h-3" />
                                            <span>{member.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(member)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(member.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <GlassCard className="w-full max-w-md p-6">
                            <h2 className="text-xl font-bold text-white mb-6">
                                {editingId ? "Edit Member" : "Add Team Member"}
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-1 block">Role</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g. Developer"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button onClick={editingId ? handleUpdate : handleCreate} className="bg-blue-600 hover:bg-blue-700">
                                        {editingId ? "Save Changes" : "Add Member"}
                                    </Button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>
        </ProjectLayout>
    );
}
