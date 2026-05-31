"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  itemName,
  isDeleting = false
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 max-h-[80vh] overflow-y-auto">
        {/* Warning Background Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-accent-red)]/10 blur-[60px]" />
        </div>

        <DialogHeader className="text-center sm:text-left relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/20 flex items-center justify-center mx-auto sm:mx-0 shadow-[0_0_20px_rgba(var(--color-accent-red-rgb),0.15)]">
              <AlertTriangle className="w-6 h-6 text-[color:var(--color-accent-red)]" />
            </div>
            <DialogTitle className="type-h3 text-[color:var(--color-nebula-fg)] text-center sm:text-left">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="type-small text-[color:var(--color-charcoal)] text-center sm:text-left">
            {description}
             {itemName && <strong className="text-[color:var(--color-nebula-fg)] font-medium"> &quot;{itemName}&quot;</strong>}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-8 justify-end pt-5 border-t border-[var(--color-nebula-hairline-strong)] relative z-10">
          <Button
            type="button"
            variant="nebula-ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isDeleting}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onConfirm();
            }}
            disabled={isDeleting}
            className="px-6 bg-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)]/90 text-white border-none shadow-[0_0_15px_rgba(var(--color-accent-red-rgb),0.3)]"
          >
            {isDeleting ? "Deleting..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}