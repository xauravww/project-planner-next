"use client";

import { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { createProjectWithAI } from "@/actions/project";
import { useRouter } from "next/navigation";
import { GraphBrainstorm, GraphNode, NodeType } from "@/components/brainstorm/GraphBrainstorm";
import { toast } from "sonner";

// Initial seed with spatial positioning
const createInitialGraph = (projectName: string, description: string): Record<string, GraphNode> => {
  const rootId = "root";
  return {
    [rootId]: {
      id: rootId,
      content: description || projectName,
      type: "root",
      x: 0,
      y: 0,
      parentId: null,
      relatedIds: [],
      aiGenerated: false,
      expanded: true,
      collapsed: false,
    },
  };
};

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"seed" | "brainstorm" | "review">("seed");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Graph state
  const [nodes, setNodes] = useState<Record<string, GraphNode>>({});
  const rootId = "root";

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("projectPlannerBrainstormDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.projectName) setProjectName(parsed.projectName);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.step) setStep(parsed.step);
        if (parsed.nodes) setNodes(parsed.nodes);
      } catch (e) {
        console.error("Failed to parse saved brainstorm draft", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (step === "seed" && !projectName && Object.keys(nodes).length === 0) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem("projectPlannerBrainstormDraft", JSON.stringify({
        projectName,
        description,
        step,
        nodes
      }));
    }, 500); // Debounce save
    return () => clearTimeout(timeoutId);
  }, [projectName, description, step, nodes]);

  // Initialize graph when moving to brainstorm step
  const startBrainstorming = useCallback(() => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }
    const initialNodes = createInitialGraph(projectName, description || projectName);
    setNodes(initialNodes);
    setStep("brainstorm");
    // Auto-generate initial suggestions for root
    generateSuggestions("root", initialNodes);
  }, [projectName, description]);

  // Generate AI suggestions - placed in circle around parent
  const generateSuggestions = useCallback(async (parentId: string, currentNodes?: Record<string, GraphNode>) => {
    const nodesToUse = currentNodes || nodes;
    const parent = nodesToUse[parentId];
    if (!parent) return;

    setGeneratingFor(parentId);

    try {
      const siblingContents = Object.values(nodesToUse)
        .filter((n) => n.parentId === parentId)
        .map((n) => n.content);

      const response = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentContent: parent.content,
          parentType: parent.type,
          siblingContents,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate suggestions");

      const { suggestions } = await response.json();

      // Add suggestions in circle formation around parent
      setNodes((prev) => {
        const newNodes = { ...prev };
        const existingChildren = Object.values(newNodes).filter((n) => n.parentId === parentId);
        const startAngle = existingChildren.length * (Math.PI * 2 / 8);
        const radius = 400;

        suggestions.forEach((suggestion: string, index: number) => {
          const id = `${parentId}-ai-${Date.now()}-${index}`;
          const type = inferTypeFromContent(suggestion, parent.type);
          const angle = startAngle + (index * (Math.PI * 2 / suggestions.length));
          
          newNodes[id] = {
            id,
            content: suggestion,
            type,
            x: parent.x + Math.cos(angle) * radius,
            y: parent.y + Math.sin(angle) * radius,
            parentId,
            relatedIds: [],
            aiGenerated: true,
            expanded: false,
            collapsed: false,
          };
        });

        return newNodes;
      });
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setGeneratingFor(null);
    }
  }, [nodes]);

  const inferTypeFromContent = (content: string, parentType: NodeType): NodeType => {
    const lower = content.toLowerCase();
    if (lower.includes("user") || lower.includes("person")) return "user";
    if (lower.includes("feature") || lower.includes("can")) return "feature";
    if (lower.includes("problem") || lower.includes("pain")) return "problem";
    if (lower.includes("solution") || lower.includes("fix")) return "solution";
    if (lower.includes("goal") || lower.includes("objective")) return "goal";
    if (lower.includes("constraint") || lower.includes("limit")) return "constraint";
    // Default based on parent
    if (parentType === "problem") return "solution";
    if (parentType === "user") return "problem";
    if (parentType === "feature") return "user";
    return "feature";
  };

  // Graph operations
  const handleUpdateNode = useCallback((id: string, updates: Partial<GraphNode>) => {
    setNodes((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...updates },
    }));
  }, []);

  const handleAddNode = useCallback((parentId: string | null, type: NodeType, x: number, y: number) => {
    setNodes((prev) => {
      const id = `node-${Date.now()}`;
      return {
        ...prev,
        [id]: {
          id,
          content: "",
          type,
          x,
          y,
          parentId,
          relatedIds: [],
          aiGenerated: false,
          expanded: true,
          collapsed: false,
        },
      };
    });
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((prev) => {
      const newNodes = { ...prev };
      delete newNodes[id];
      // Remove from related lists
      Object.values(newNodes).forEach((n) => {
        n.relatedIds = n.relatedIds.filter((rid) => rid !== id);
      });
      return newNodes;
    });
  }, []);

  const handleConnectNodes = useCallback((fromId: string, toId: string) => {
    setNodes((prev) => ({
      ...prev,
      [fromId]: {
        ...prev[fromId],
        relatedIds: [...new Set([...prev[fromId].relatedIds, toId])],
      },
    }));
  }, []);


  // Calculate progress based on graph complexity
  const getProgress = useCallback(() => {
    const root = nodes[rootId];
    if (!root) return 0;

    const nodeList = Object.values(nodes);
    const totalNodes = nodeList.length;
    const crossConnections = nodeList.reduce((sum, n) => sum + n.relatedIds.length, 0) / 2;
    const types = new Set(nodeList.map((n) => n.type));

    // Score: nodes (30%), depth (20%), connections (20%), variety (30%)
    let score = 0;
    if (totalNodes >= 3) score += 15;
    if (totalNodes >= 6) score += 15;
    if (crossConnections >= 1) score += 10;
    if (crossConnections >= 3) score += 10;
    if (types.has("user")) score += 10;
    if (types.has("feature")) score += 10;
    if (types.has("problem")) score += 10;

    return Math.min(score, 100);
  }, [nodes, rootId]);

  const progress = getProgress();

  // Create project from graph
  const handleCreateProject = useCallback(async () => {
    setIsCreating(true);

    // Convert graph to structured description with spatial relationships
    const graphToDescription = (): string => {
      const lines: string[] = [];
      const processed = new Set<string>();

      const traverse = (nodeId: string, depth = 0) => {
        if (processed.has(nodeId)) return;
        processed.add(nodeId);

        const node = nodes[nodeId];
        if (!node) return;

        const indent = "  ".repeat(depth);
        lines.push(`${indent}- ${node.type.toUpperCase()}: ${node.content}`);

        // Add cross-connections note
        if (node.relatedIds.length > 0) {
          const related = node.relatedIds
            .filter((id) => nodes[id])
            .map((id) => nodes[id].type)
            .filter((t, i, arr) => arr.indexOf(t) === i);
          if (related.length > 0) {
            lines.push(`${indent}  (relates to: ${related.join(", ")})`);
          }
        }

        // Find children (hierarchical)
        const children = Object.values(nodes).filter((n) => n.parentId === nodeId);
        children.forEach((child) => traverse(child.id, depth + 1));
      };

      traverse(rootId);
      return lines.join("\n");
    };

    const description = graphToDescription();

    const result = await createProjectWithAI(projectName, description, [
      { role: "assistant", content: "Project brainstormed using graph visualization" },
      { role: "user", content: `Project: ${projectName}\n\n${description}` },
    ]);

    if (result.success && result.projectId) {
      localStorage.removeItem("projectPlannerBrainstormDraft");
      router.push(`/projects/${result.projectId}`);
    } else {
      toast.error("Failed to create project");
      setIsCreating(false);
    }
  }, [nodes, projectName, router, rootId]);

  // --- Render Steps ---

  // Step 1: Seed - Editorial style matching homepage
  if (step === "seed") {
    return (
      <div className="min-h-screen bg-[var(--color-nebula-bg)] flex flex-col">
        {/* Minimal nav */}
        <div className="px-6 py-6">
          <Link
            href="/dashboard"
            className="type-small text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* Main content - editorial layout */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            
            {/* Headline - Resend style with italic accent */}
            <h1 className="type-display text-[color:var(--color-nebula-fg)] mb-6">
              What are you{" "}
              <em className="type-italic-accent">building?</em>
            </h1>

            <p className="type-subtitle max-w-lg mb-12">
              A name and a sentence is all we need. The rest, we'll figure out together.
            </p>

            {/* Form - minimal, elegant */}
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="type-caption text-[color:var(--color-ash)]">
                  Name your project
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Vintage Camera Marketplace"
                  className="w-full bg-transparent border-b-2 border-[var(--color-nebula-hairline-strong)] 
                           focus:border-[color:var(--color-nebula-fg)] outline-none
                           py-3 text-2xl text-[color:var(--color-nebula-fg)] placeholder:text-[color:var(--color-ash)]/50
                           transition-colors font-serif"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="type-caption text-[color:var(--color-ash)]">
                  One-line pitch
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A curated marketplace for film photography enthusiasts"
                  className="w-full bg-transparent border-b-2 border-[var(--color-nebula-hairline-strong)] 
                           focus:border-[color:var(--color-nebula-fg)] outline-none
                           py-3 text-lg text-[color:var(--color-charcoal)] placeholder:text-[color:var(--color-ash)]/50
                           transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && projectName.trim() && startBrainstorming()}
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={startBrainstorming}
                  disabled={!projectName.trim()}
                  className="nebula-btn nebula-btn--primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start brainstorming
                </button>
                
                {projectName.trim() && (
                  <span className="ml-4 type-caption text-[color:var(--color-ash)]">
                    Press Enter ↵
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 py-6 text-center">
          <p className="type-caption text-[color:var(--color-ash)]/60">
            Not sure yet? Just type anything — we'll help you refine it.
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Brainstorm
  if (step === "brainstorm") {
    return (
      <div className="h-screen flex flex-col bg-[var(--color-nebula-bg)]">
        {/* Minimal header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep("seed")}
              className="type-small text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
            >
              ← Back
            </button>
            <span className="type-body text-[color:var(--color-nebula-fg)]">{projectName}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="type-caption text-[color:var(--color-ash)]">{progress}%</span>
              <div className="h-1.5 w-20 bg-[var(--color-nebula-hairline-strong)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-nebula-fg)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setStep("review")}
              disabled={progress < 50}
              className={progress >= 50 ? "nebula-btn nebula-btn--primary" : "nebula-btn nebula-btn--ghost opacity-40 cursor-not-allowed"}
            >
              Continue →
            </button>
          </div>
        </div>

        {/* Content - Full width graph canvas */}
        <div className="flex-1 overflow-hidden relative">
          <GraphBrainstorm
            nodes={nodes}
            rootId={rootId}
            onUpdateNode={handleUpdateNode}
            onAddNode={handleAddNode}
            onDeleteNode={handleDeleteNode}
            onConnectNodes={handleConnectNodes}
            onGenerateSuggestions={generateSuggestions}
            generatingFor={generatingFor}
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  // Step 3: Review - Editorial style
  return (
    <div className="min-h-screen bg-[var(--color-nebula-bg)] flex flex-col">
      {/* Minimal nav */}
      <div className="px-6 py-6">
        <button
          onClick={() => setStep("brainstorm")}
          className="type-small text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="type-display text-[color:var(--color-nebula-fg)] mb-2">
            Review your <em className="type-italic-accent">plan</em>
          </h1>
          <p className="type-subtitle text-[color:var(--color-ash)] mb-12">
            {projectName}
          </p>

          {/* Stats - minimal */}
          <div className="flex gap-8 mb-12">
            <div>
              <div className="type-h2 text-[color:var(--color-nebula-fg)]">{Object.values(nodes).length}</div>
              <div className="type-caption text-[color:var(--color-ash)]">nodes</div>
            </div>
            <div>
              <div className="type-h2 text-[color:var(--color-nebula-fg)]">
                {Object.values(nodes).reduce((sum, n) => sum + n.relatedIds.length, 0) / 2}
              </div>
              <div className="type-caption text-[color:var(--color-ash)]">connections</div>
            </div>
            <div>
              <div className="type-h2 text-[color:var(--color-nebula-fg)]">{progress}%</div>
              <div className="type-caption text-[color:var(--color-ash)]">complexity</div>
            </div>
          </div>

          {/* Editable name */}
          <div className="mb-8">
            <label className="type-caption text-[color:var(--color-ash)] mb-2 block">
              Project name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[var(--color-nebula-hairline-strong)] 
                       focus:border-[color:var(--color-nebula-fg)] outline-none
                       py-3 text-2xl text-[color:var(--color-nebula-fg)] font-serif
                       transition-colors"
            />
          </div>

          {/* Overview */}
          <div className="mb-12">
            <label className="type-caption text-[color:var(--color-ash)] mb-4 block">
              Overview
            </label>
            <div className="space-y-2 max-h-64 overflow-auto">
              {(() => {
                const lines: { content: string; depth: number; connects: number }[] = [];
                const processed = new Set<string>();
                const traverse = (nodeId: string, depth = 0) => {
                  if (processed.has(nodeId)) return;
                  processed.add(nodeId);
                  const node = nodes[nodeId];
                  if (!node) return;
                  lines.push({ 
                    content: `${node.type}: ${node.content}`, 
                    depth,
                    connects: node.relatedIds.length 
                  });
                  Object.values(nodes)
                    .filter((n) => n.parentId === nodeId)
                    .forEach((child) => traverse(child.id, depth + 1));
                };
                traverse("root");
                return lines.map((line, i) => (
                  <div 
                    key={i} 
                    className="type-body text-[color:var(--color-charcoal)]"
                    style={{ marginLeft: `${line.depth * 20}px` }}
                  >
                    {line.depth > 0 && "↳ "}{line.content}
                    {line.connects > 0 && (
                      <span className="text-[color:var(--color-ash)] text-sm ml-2">
                        ({line.connects} links)
                      </span>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleCreateProject}
            disabled={isCreating}
            className="nebula-btn nebula-btn--primary disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create project →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
