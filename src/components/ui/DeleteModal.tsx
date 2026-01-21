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
      <DialogContent className="bg-black/90 border-red-500/30 backdrop-blur-xl max-w-md p-6 max-h-[80vh] overflow-y-auto">
        {/* Warning Background Effect */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-20" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-red-500/20 blur-xl" />
        </div>

        <DialogHeader className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mx-auto sm:mx-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <DialogTitle className="text-xl text-white text-center sm:text-left">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 text-center sm:text-left">
            {description}
             {itemName && <strong className="text-white"> &quot;{itemName}&quot;</strong>}?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-6 justify-end pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Cancel button clicked");
              onClose();
            }}
            disabled={isDeleting}
            className="border border-gray-600 text-gray-300 hover:bg-gray-700 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Delete button clicked in modal");
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : confirmText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}