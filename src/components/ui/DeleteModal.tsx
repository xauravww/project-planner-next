"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
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
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  itemName
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-red-500/30 backdrop-blur-xl relative overflow-hidden max-w-md z-[100] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Warning Background Effect */}
        <div className="absolute inset-0 bg-gradient-radial pointer-events-none opacity-20" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-red-500/20 blur-xl" />
        </div>

        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <DialogTitle className="text-xl text-white">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            {description}
            {itemName && <strong className="text-white"> "{itemName}"</strong>}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}