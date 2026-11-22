"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { deleteProject } from "@/actions/project";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    /** Called after a successful deletion so the parent can update its UI. */
    onDeleted?: () => void;
}

export function DeleteProjectModal({ isOpen, onClose, projectId, projectName, onDeleted }: DeleteProjectModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProject(projectId);
            onDeleted?.();
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="border-2 border-black bg-white rounded-none">
                <DialogHeader>
                    <DialogTitle className="type-h3 text-center">Delete project?</DialogTitle>
                    <DialogDescription className="mt-3 text-center text-black/70">
                        &ldquo;{projectName}&rdquo; will be permanently deleted. This can&apos;t be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="nebula-btn nebula-btn--ghost flex-1 justify-center disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <KineticSpinner className="h-4 w-4" />
                                Deleting
                            </>
                        ) : (
                            "Delete"
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
