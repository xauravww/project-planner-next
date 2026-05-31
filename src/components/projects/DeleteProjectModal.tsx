"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { deleteProject } from "@/actions/project";
import { useRouter } from "next/navigation";

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectModal({ isOpen, onClose, projectId, projectName }: DeleteProjectModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-lg)] relative overflow-hidden">
        <DialogHeader>
          <DialogTitle className="type-h3 text-center">
            Enter the Black Hole
          </DialogTitle>
          <DialogDescription className="text-center text-[color:var(--color-charcoal)] mt-4">
            &ldquo;{projectName}&rdquo; is about to be pulled into the cosmic void. This action cannot be undone &mdash;
            all plans, stories, and dreams within will vanish forever. Are you certain this star must collapse?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 mt-6">
          <Button variant="nebula-ghost" onClick={onClose} disabled={isDeleting}>
            Spare It
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-[var(--color-accent-red)] text-[color:var(--color-nebula-fg)] shadow-[0_0_20px_var(--color-accent-red-glow)]"
          >
            {isDeleting ? "Collapsing..." : "Confirm Deletion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}