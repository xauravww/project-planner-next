"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DeleteProjectModal } from "./DeleteProjectModal";

interface DeleteProjectButtonProps {
    projectId: string;
    projectName: string;
    /** Called after a successful deletion so the parent can update its UI. */
    onDeleted?: () => void;
}

export function DeleteProjectButton({ projectId, projectName, onDeleted }: DeleteProjectButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                aria-label={`Delete project ${projectName}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
                className="inline-grid h-8 w-8 place-items-center border-2 border-black text-black transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
            >
                <Trash2 className="h-4 w-4" />
            </button>
            <DeleteProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
                projectName={projectName}
                onDeleted={onDeleted}
            />
        </>
    );
}
