"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Plus,
    SlidersHorizontal,
    ArrowUp,
    X,
    FileText,
    ImageIcon,
    Video,
    Music,
    Archive,
    ChevronDown,
    Check,
    Loader2,
    AlertCircle,
    Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
export interface FileWithPreview {
    id: string;
    file: File;
    preview?: string;
    type: string;
    uploadStatus: "pending" | "uploading" | "complete" | "error";
    uploadProgress?: number;
    abortController?: AbortController;
    textContent?: string;
}

export interface PastedContent {
    id: string;
    content: string;
    timestamp: Date;
    wordCount: number;
}

export interface ModelOption {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

interface ChatInputProps {
    onSendMessage?: (
        message: string,
        files: FileWithPreview[],
        pastedContent: PastedContent[]
    ) => void;
    disabled?: boolean;
    placeholder?: string;
    maxFiles?: number;
    maxFileSize?: number; // in bytes
    acceptedFileTypes?: string[];
    models?: ModelOption[];
    defaultModel?: string;
    onModelChange?: (modelId: string) => void;
    className?: string; // Added className prop
}

// Constants
const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PASTE_THRESHOLD = 200; // characters threshold for showing as pasted content
const DEFAULT_MODELS_INTERNAL: ModelOption[] = [
    {
        id: "nebula-pro",
        name: "Nebula Pro",
        description: "Deep reasoning",
        badge: "Best",
    },
    {
        id: "nebula-flash",
        name: "Nebula Flash",
        description: "Fast responses",
        badge: "Fast",
    },
];

// File type helpers
const getFileTypeLabel = (type: string): string => {
    const parts = type.split("/");
    let label = parts[parts.length - 1].toUpperCase();
    if (label.length > 7 && label.includes("-")) {
        label = label.substring(0, label.indexOf("-"));
    }
    if (label.length > 10) {
        label = label.substring(0, 10) + "...";
    }
    return label;
};

// Helper function to check if a file is textual
const isTextualFile = (file: File): boolean => {
    const textualTypes = [
        "text/",
        "application/json",
        "application/xml",
        "application/javascript",
        "application/typescript",
    ];

    const textualExtensions = ["txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "htm", "css", "scss", "sass", "json", "xml", "yaml", "yml", "csv", "sql", "sh", "bash", "php", "rb", "go", "java", "c", "cpp", "h", "hpp", "cs", "rs", "swift", "kt", "scala", "r", "vue", "svelte", "astro", "config", "conf", "ini", "toml", "log", "gitignore", "dockerfile", "makefile", "readme"];

    const isTextualMimeType = textualTypes.some((type) =>
        file.type.toLowerCase().startsWith(type)
    );

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const isTextualExtension =
        textualExtensions.includes(extension) ||
        file.name.toLowerCase().includes("readme") ||
        file.name.toLowerCase().includes("dockerfile") ||
        file.name.toLowerCase().includes("makefile");

    return isTextualMimeType || isTextualExtension;
};

// Helper function to read file content as text
const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || "");
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

// Helper function to get file extension for badge
const getFileExtension = (filename: string): string => {
    const extension = filename.split(".").pop()?.toUpperCase() || "FILE";
    return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
};

// File Preview Component
const FilePreviewCard: React.FC<{
    file: FileWithPreview;
    onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
    const isImage = file.type.startsWith("image/");
    const isTextual = isTextualFile(file.file);

    if (isTextual) {
        return <TextualFilePreviewCard file={file} onRemove={onRemove} />;
    }

    return (
        <div
            className={cn(
                "relative group bg-zinc-700 border w-fit border-zinc-600 rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden",
                isImage ? "p-0" : "p-3"
            )}
        >
            <div className="flex items-start gap-3 size-[125px] overflow-hidden">
                {isImage && file.preview ? (
                    <div className="relative size-full rounded-md overflow-hidden bg-zinc-600">
                        <img
                            src={file.preview || "/placeholder.svg"}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <></>
                )}
                {!isImage && (
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
                                <p className="absolute bottom-2 left-2 capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
                                    {getFileTypeLabel(file.type)}
                                </p>
                            </div>
                            {file.uploadStatus === "uploading" && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                            )}
                            {file.uploadStatus === "error" && (
                                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                            )}
                        </div>

                        <p
                            className="max-w-[90%] text-xs font-medium text-zinc-100 truncate"
                            title={file.file.name}
                        >
                            {file.file.name}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-1">
                            {formatFileSize(file.file.size)}
                        </p>
                    </div>
                )}
            </div>
            <Button
                size="icon"
                variant="outline"
                className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 border-none bg-black/50 hover:bg-black/80 text-white"
                onClick={() => onRemove(file.id)}
            >
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
};

// Pasted Content Preview Component
const PastedContentCard: React.FC<{
    content: PastedContent;
    onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const previewText = content.content.slice(0, 150);
    const needsTruncation = content.content.length > 150;

    return (
        <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
            <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
                {isExpanded || !needsTruncation ? content.content : previewText}
                {!isExpanded && needsTruncation && "..."}
            </div>
            {/* OVERLAY */}
            <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
                <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
                    PASTED
                </p>
                {/* Actions */}
                <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="size-6 border-none bg-black/50 hover:bg-black/80 text-white"
                        onClick={() => onRemove(content.id)}
                        title="Remove content"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Textual File Preview Component
const TextualFilePreviewCard: React.FC<{
    file: FileWithPreview;
    onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const previewText = file.textContent?.slice(0, 150) || "";
    const needsTruncation = (file.textContent?.length || 0) > 150;
    const fileExtension = getFileExtension(file.file.name);

    return (
        <div className="bg-zinc-700 border border-zinc-600 relative rounded-lg p-3 size-[125px] shadow-md flex-shrink-0 overflow-hidden">
            <div className="text-[8px] text-zinc-300 whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
                {file.textContent ? (
                    <>
                        {isExpanded || !needsTruncation ? file.textContent : previewText}
                        {!isExpanded && needsTruncation && "..."}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>
            {/* OVERLAY */}
            <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[#30302E] from-transparent overflow-hidden">
                <p className="capitalize text-white text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-md">
                    {fileExtension}
                </p>
                {/* Upload status indicator */}
                {file.uploadStatus === "uploading" && (
                    <div className="absolute top-2 left-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
                    </div>
                )}
                {file.uploadStatus === "error" && (
                    <div className="absolute top-2 left-2">
                        <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    </div>
                )}
                {/* Actions */}
                <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-2 right-2">
                    <Button
                        size="icon"
                        variant="outline"
                        className="size-6 border-none bg-black/50 hover:bg-black/80 text-white"
                        onClick={() => onRemove(file.id)}
                        title="Remove file"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Main ChatInput Component
export const ClaudeChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    disabled = false,
    placeholder = "How can I help you today?",
    maxFiles = MAX_FILES,
    maxFileSize = MAX_FILE_SIZE,
    acceptedFileTypes,
    models = DEFAULT_MODELS_INTERNAL,
    defaultModel,
    onModelChange,
    className,
}) => {
    const [message, setMessage] = useState("");
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedModel, setSelectedModel] = useState(
        defaultModel || models[0]?.id || ""
    );

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const maxHeight = 120;
            textareaRef.current.style.height = `${Math.min(
                textareaRef.current.scrollHeight,
                maxHeight
            )}px`;
        }
    }, [message]);

    const handleFileSelect = useCallback(
        (selectedFiles: FileList | null) => {
            if (!selectedFiles) return;

            const currentFileCount = files.length;
            if (currentFileCount >= maxFiles) {
                alert(
                    `Maximum ${maxFiles} files allowed. Please remove some files to add new ones.`
                );
                return;
            }

            const availableSlots = maxFiles - currentFileCount;
            const filesToAdd = Array.from(selectedFiles).slice(0, availableSlots);

            const newFiles = filesToAdd.map((file) => ({
                id: Math.random().toString(),
                file,
                preview: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : undefined,
                type: file.type || "application/octet-stream",
                uploadStatus: "pending" as const,
                uploadProgress: 0,
            }));

            setFiles((prev) => [...prev, ...newFiles]);

            newFiles.forEach((fileToUpload) => {
                // Read text content for textual files
                if (isTextualFile(fileToUpload.file)) {
                    readFileAsText(fileToUpload.file)
                        .then((textContent) => {
                            setFiles((prev) =>
                                prev.map((f) =>
                                    f.id === fileToUpload.id ? { ...f, textContent } : f
                                )
                            );
                        })
                        .catch((error) => {
                            console.error("Error reading file content:", error);
                        });
                }

                // Simulate upload
                setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, uploadStatus: "complete" } : f));
            });
        },
        [files.length, maxFiles]
    );

    const removeFile = useCallback((id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, []);

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            const clipboardData = e.clipboardData;
            const items = clipboardData.items;

            const fileItems = Array.from(items).filter(
                (item) => item.kind === "file"
            );
            if (fileItems.length > 0 && files.length < maxFiles) {
                e.preventDefault();
                const pastedFiles = fileItems
                    .map((item) => item.getAsFile())
                    .filter(Boolean) as File[];
                const dataTransfer = new DataTransfer();
                pastedFiles.forEach((file) => dataTransfer.items.add(file));
                handleFileSelect(dataTransfer.files);
                return;
            }
        },
        [handleFileSelect, files.length, maxFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) {
                handleFileSelect(e.dataTransfer.files);
            }
        },
        [handleFileSelect]
    );

    const handleSend = useCallback(() => {
        if (
            disabled ||
            (!message.trim() && files.length === 0 && pastedContent.length === 0)
        )
            return;

        onSendMessage?.(message, files, pastedContent);

        setMessage("");
        setFiles([]);
        setPastedContent([]);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    }, [message, files, pastedContent, disabled, onSendMessage]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    const canSend = (message.trim() || files.length > 0) && !disabled;

    return (
        <div
            className={cn("relative w-full", className)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-[#1C3F62] border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-sm text-blue-500 flex items-center gap-2">
                        <ImageIcon className="size-4 opacity-50" />
                        Drop files here to add to chat
                    </p>
                </div>
            )}

            <div className="bg-[#30302E] border border-zinc-700 rounded-xl shadow-lg flex flex-col">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 min-h-[50px] w-full p-4 border-none outline-none resize-none bg-transparent text-zinc-100 shadow-none focus:ring-0 placeholder:text-zinc-500 text-base scrollbar-none"
                    rows={1}
                />

                {(files.length > 0 || pastedContent.length > 0) && (
                    <div className="overflow-x-auto border-t-[1px] p-3 border-zinc-700 w-full bg-[#262624]">
                        <div className="flex gap-3">
                            {files.map((file) => (
                                <FilePreviewCard
                                    key={file.id}
                                    file={file}
                                    onRemove={removeFile}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 justify-between w-full px-3 pb-1.5">
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 flex-shrink-0"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled || files.length >= maxFiles}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            className={cn(
                                "h-9 w-9 p-0 flex-shrink-0 rounded-md transition-colors",
                                canSend
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                            )}
                            onClick={handleSend}
                            disabled={!canSend}
                        >
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={acceptedFileTypes?.join(",")}
                onChange={(e) => {
                    handleFileSelect(e.target.files);
                    if (e.target) e.target.value = ""; // Reset file input
                }}
            />
        </div>
    );
};
