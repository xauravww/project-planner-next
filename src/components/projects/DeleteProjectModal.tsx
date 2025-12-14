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
      <DialogContent className="bg-black/90 border-purple-500/30 backdrop-blur-xl relative overflow-hidden">
        {/* Black Hole Background Effect */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ccircle cx='50' cy='50' r='2' fill='white' opacity='0.1'/%3e%3c/svg%3e")`,
            backgroundSize: '20px 20px',
            animation: 'swirl 3s linear infinite',
          }}
        />


        <DialogHeader>
          <DialogTitle className="modal-title text-2xl text-gradient text-center">
            Enter the Black Hole
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground mt-4">
            &ldquo;{projectName}&rdquo; is about to be pulled into the cosmic void. This action cannot be undone &mdash;
            all plans, stories, and dreams within will vanish forever. Are you certain this star must collapse?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Spare It
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
          >
            {isDeleting ? "Collapsing..." : "Confirm Deletion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}