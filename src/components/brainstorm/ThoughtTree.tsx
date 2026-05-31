"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Plus, Sparkles, User, Lightbulb, AlertCircle, CheckCircle2, Zap, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThoughtType = "root" | "user" | "feature" | "problem" | "solution" | "goal";

export interface ThoughtNode {
  id: string;
  content: string;
  type: ThoughtType;
  parentId: string | null;
  children: string[];
  aiGenerated: boolean;
  expanded: boolean;
}

interface ThoughtTreeProps {
  nodes: Record<string, ThoughtNode>;
  rootId: string;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string, type: ThoughtType) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onGenerateSuggestions: (parentId: string) => void;
  generatingFor: string | null;
  className?: string;
}

const typeConfig: Record<ThoughtType, { icon: React.ElementType; color: string; label: string }> = {
  root: { icon: Lightbulb, color: "text-amber-400", label: "Idea" },
  user: { icon: User, color: "text-blue-400", label: "User" },
  feature: { icon: Zap, color: "text-green-400", label: "Feature" },
  problem: { icon: AlertCircle, color: "text-red-400", label: "Problem" },
  solution: { icon: CheckCircle2, color: "text-emerald-400", label: "Solution" },
  goal: { icon: Sparkles, color: "text-purple-400", label: "Goal" },
};

function TreeNode({
  node,
  nodes,
  depth,
  isLast,
  parentIds,
  onToggleExpand,
  onAddChild,
  onUpdateContent,
  onDelete,
  onGenerateSuggestions,
  generatingFor,
}: {
  node: ThoughtNode;
  nodes: Record<string, ThoughtNode>;
  depth: number;
  isLast: boolean;
  parentIds: string[];
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string, type: ThoughtType) => void;
  onUpdateContent: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onGenerateSuggestions: (parentId: string) => void;
  generatingFor: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasChildren = node.children.length > 0;
  const isGenerating = generatingFor === node.id;
  const config = typeConfig[node.type];
  const Icon = config.icon;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdateContent(node.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditContent(node.content);
      setIsEditing(false);
    }
  };

  // Calculate branch lines for visual tree
  const showConnector = depth > 0;
  const isRoot = node.type === "root";

  return (
    <div className="relative">
      {/* Connector lines */}
      {showConnector && (
        <>
          {/* Horizontal line from parent */}
          <div
            className="absolute left-0 top-6 w-4 h-px bg-[var(--color-nebula-hairline-strong)]"
            style={{ marginLeft: "-16px" }}
          />
          {/* Vertical line continuation (if not last) */}
          {!isLast && (
            <div
              className="absolute left-0 top-6 w-px bg-[var(--color-nebula-hairline-strong)]"
              style={{
                marginLeft: "-16px",
                height: "calc(100% + 8px)",
              }}
            />
          )}
        </>
      )}

      {/* Node Card */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "group relative rounded-[var(--r-lg)] border transition-all",
          isRoot
            ? "bg-[var(--color-nebula-surface)] border-[var(--color-nebula-fg)]/30 p-4 mb-4"
            : "bg-[var(--color-nebula-bg)] border-[var(--color-nebula-hairline-strong)] p-3 mb-2 hover:border-[var(--color-nebula-hairline-strong)]/80",
          node.aiGenerated && !isRoot && "border-dashed border-[var(--color-nebula-fg)]/20",
          isGenerating && "animate-pulse border-[var(--color-nebula-fg)]/50"
        )}
      >
        <div className="flex items-start gap-3">
          {/* Expand/Collapse + Icon */}
          <div className="flex items-center gap-2 shrink-0">
            {hasChildren && (
              <button
                onClick={() => onToggleExpand(node.id)}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-[var(--color-ash)] transition-transform",
                    node.expanded && "rotate-90"
                  )}
                />
              </button>
            )}
            {!hasChildren && <div className="w-5" />}
            <div className={cn("w-8 h-8 rounded-[var(--r-md)] flex items-center justify-center bg-[var(--color-surface-elevated)]", config.color)}>
              <Icon className="w-4 h-4" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={inputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[color:var(--color-nebula-fg)] type-body focus:outline-none"
              />
            ) : (
              <div
                onClick={() => !isRoot && setIsEditing(true)}
                className={cn(
                  "type-body text-[color:var(--color-charcoal)]",
                  !isRoot && "cursor-pointer hover:text-[color:var(--color-nebula-fg)] transition-colors"
                )}
              >
                {node.content}
              </div>
            )}

            {/* Type label + AI badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className={cn("type-caption", config.color)}>{config.label}</span>
              {node.aiGenerated && (
                <span className="type-caption text-[var(--color-nebula-fg)]/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI suggested
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isRoot && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(node.id)}
                className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-ash)] hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Add child buttons */}
        <div className="flex items-center gap-2 mt-3 ml-14">
          <button
            onClick={() => onGenerateSuggestions(node.id)}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-md)] type-caption transition-colors",
              isGenerating
                ? "bg-[var(--color-nebula-fg)]/10 text-[var(--color-nebula-fg)]"
                : "bg-[var(--color-surface-elevated)] text-[var(--color-ash)] hover:text-[color:var(--color-nebula-fg)] hover:bg-[var(--color-nebula-fg)]/10"
            )}
          >
            <Sparkles className={cn("w-3 h-3", isGenerating && "animate-spin")} />
            {isGenerating ? "Thinking..." : "Get ideas"}
          </button>
          <div className="w-px h-4 bg-[var(--color-nebula-hairline-strong)] mx-1" />
          {(["user", "feature", "problem", "solution"] as ThoughtType[]).map((type) => (
            <button
              key={type}
              onClick={() => onAddChild(node.id, type)}
              className="p-1.5 rounded hover:bg-[var(--color-surface-elevated)] text-[var(--color-ash)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
              title={`Add ${typeConfig[type].label}`}
            >
              {type === "user" && <User className="w-3.5 h-3.5" />}
              {type === "feature" && <Zap className="w-3.5 h-3.5" />}
              {type === "problem" && <AlertCircle className="w-3.5 h-3.5" />}
              {type === "solution" && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {node.expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative ml-8 pl-4"
          >
            {node.children.map((childId, index) => (
              <TreeNode
                key={childId}
                node={nodes[childId]}
                nodes={nodes}
                depth={depth + 1}
                isLast={index === node.children.length - 1}
                parentIds={[...parentIds, node.id]}
                onToggleExpand={onToggleExpand}
                onAddChild={onAddChild}
                onUpdateContent={onUpdateContent}
                onDelete={onDelete}
                onGenerateSuggestions={onGenerateSuggestions}
                generatingFor={generatingFor}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ThoughtTree({
  nodes,
  rootId,
  onToggleExpand,
  onAddChild,
  onUpdateContent,
  onDelete,
  onGenerateSuggestions,
  generatingFor,
  className,
}: ThoughtTreeProps) {
  const rootNode = nodes[rootId];
  if (!rootNode) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <TreeNode
        node={rootNode}
        nodes={nodes}
        depth={0}
        isLast={true}
        parentIds={[]}
        onToggleExpand={onToggleExpand}
        onAddChild={onAddChild}
        onUpdateContent={onUpdateContent}
        onDelete={onDelete}
        onGenerateSuggestions={onGenerateSuggestions}
        generatingFor={generatingFor}
      />
    </div>
  );
}
