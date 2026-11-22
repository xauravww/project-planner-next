"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { KineticSpinner } from "@/components/auth/KineticAuthShell";

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
    isDeleting = false,
}: DeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md border-2 border-black bg-white rounded-none p-6">
                <DialogHeader>
                    <DialogTitle className="type-h3 text-center">{title}</DialogTitle>
                    <DialogDescription className="mt-3 text-center text-black/70">
                        {description}
                        {itemName && <strong className="text-black"> "{itemName}"</strong>}
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
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="nebula-btn nebula-btn--primary flex-1 justify-center disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <KineticSpinner className="h-4 w-4" />
                                Deleting
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
