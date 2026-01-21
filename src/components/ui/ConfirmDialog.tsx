import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    intent?: "danger" | "warning" | "info";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    intent = "danger"
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const confirmButtonClass = intent === "danger"
        ? "bg-red-500 hover:bg-red-600 text-white"
        : intent === "warning"
            ? "bg-amber-500 hover:bg-amber-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">{title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-gray-300 text-base leading-relaxed">{description}</p>
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className={confirmButtonClass}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
