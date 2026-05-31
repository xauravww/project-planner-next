"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  NodeChange,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  NodeToolbar,
  useNodesState,
  useEdgesState,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Users,
  Zap,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  GripHorizontal,
  Pen,
  Wand2,
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Maximize
} from "lucide-react";
import { cn } from "@/lib/utils";
import dagre from "dagre";

// Types
export type NodeType = "root" | "user" | "feature" | "problem" | "solution" | "goal" | "constraint";

export interface GraphNode {
  id: string;
  content: string;
  type: NodeType;
  x: number;
  y: number;
  parentId: string | null;
  relatedIds: string[];
  aiGenerated: boolean;
  expanded: boolean;
  collapsed: boolean;
}

interface GraphBrainstormProps {
  nodes: Record<string, GraphNode>;
  rootId: string;
  onUpdateNode: (id: string, updates: Partial<GraphNode>) => void;
  onAddNode: (parentId: string | null, type: NodeType, x: number, y: number) => void;
  onDeleteNode: (id: string) => void;
  onConnectNodes: (fromId: string, toId: string) => void;
  onGenerateSuggestions: (nodeId: string) => void;
  generatingFor: string | null;
  className?: string;
}

const typeConfig: Record<NodeType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  root: { icon: Sparkles, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", label: "Idea" },
  user: { icon: Users, color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)", label: "User" },
  feature: { icon: Zap, color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)", label: "Feature" },
  problem: { icon: AlertCircle, color: "#f87171", bg: "rgba(248, 113, 113, 0.1)", label: "Problem" },
  solution: { icon: CheckCircle2, color: "#34d399", bg: "rgba(52, 211, 153, 0.1)", label: "Solution" },
  goal: { icon: Sparkles, color: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)", label: "Goal" },
  constraint: { icon: GitBranch, color: "#fb923c", bg: "rgba(251, 146, 60, 0.1)", label: "Constraint" },
};

// Dagre layout configuration
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 280;
  const nodeHeight = 160;

  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    // Only use hierarchical edges for dagre layout to avoid weird loops
    if (!edge.id.includes('-related')) {
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
    return newNode;
  });

  return newNodes;
};

// Custom Node Component
function BrainstormNode({ data, selected }: any) {
  const { node, onAddChild, onGenerate, onDelete, onUpdateContent, generatingFor } = data;
  const config = typeConfig[node.type as NodeType] || typeConfig.feature;
  const Icon = config.icon;
  const isGenerating = generatingFor === node.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onUpdateContent(editContent);
    setIsEditing(false);
  };

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        className="flex gap-1.5 p-1.5 bg-[var(--color-surface-elevated)] border border-white/10 rounded-xl shadow-2xl backdrop-blur-md mb-2"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onGenerate(); }}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors group relative"
          title="AI Suggest Ideas"
        >
          <Wand2 className={cn("w-4 h-4 text-amber-300", isGenerating && "animate-pulse")} />
          <span className="text-xs font-medium text-amber-300/90 hidden sm:inline-block">AI Ideas</span>
        </button>
        <div className="w-px h-5 bg-white/10 mx-1 self-center" />
        {(["user", "feature", "problem", "solution", "goal", "constraint"] as NodeType[]).map((type) => (
          <button
            key={type}
            onClick={(e) => { e.stopPropagation(); onAddChild(type); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
            title={`Add ${typeConfig[type].label}`}
          >
            {type === "user" && <Users className="w-4 h-4 text-blue-400" />}
            {type === "feature" && <Zap className="w-4 h-4 text-green-400" />}
            {type === "problem" && <AlertCircle className="w-4 h-4 text-red-400" />}
            {type === "solution" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {type === "goal" && <Sparkles className="w-4 h-4 text-purple-400" />}
            {type === "constraint" && <GitBranch className="w-4 h-4 text-orange-400" />}
          </button>
        ))}
        <div className="w-px h-5 bg-white/10 mx-1 self-center" />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 flex items-center justify-center"
          title="Delete Node"
        >
          <X className="w-4 h-4" />
        </button>
      </NodeToolbar>

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-[var(--color-nebula-hairline-strong)] !border-2 !border-[var(--color-nebula-surface)] transition-transform hover:scale-150 z-10" />
      
      <div
        className={cn(
          "relative w-72 rounded-[var(--r-xl)] border transition-all bg-[var(--color-nebula-surface)] shadow-md overflow-hidden",
          selected ? "border-[var(--color-nebula-fg)] shadow-xl shadow-[var(--color-nebula-fg)]/20 ring-1 ring-[var(--color-nebula-fg)]/50" : "border-white/10 hover:border-white/30",
          node.aiGenerated && "border-dashed border-white/30"
        )}
      >
        {/* Background gradient hint */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `linear-gradient(to bottom right, ${config.color}, transparent)` }}
        />

        {/* Header - Drag Handle Area */}
        <div className="custom-drag-handle flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/5 cursor-grab active:cursor-grabbing">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-nebula-bg)] shadow-inner"
            style={{ color: config.color }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="type-caption font-medium flex-1 tracking-wide" style={{ color: config.color }}>{config.label}</span>
          
          <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleEditToggle} 
              className="p-1 hover:bg-white/10 rounded cursor-pointer nodrag"
              title="Edit text"
            >
              <Pen className="w-3.5 h-3.5 text-white" />
            </button>
            <GripHorizontal className="w-4 h-4 text-white/50" />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-5 py-4 nodrag cursor-text min-h-[80px]">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              className="w-full bg-transparent resize-none text-[15px] leading-relaxed text-[color:var(--color-nebula-fg)] focus:outline-none min-h-[60px] nowheel nodrag nopan"
              autoFocus
            />
          ) : (
            <p 
              className="text-[15px] leading-relaxed text-[color:var(--color-charcoal)] line-clamp-4 min-h-[60px]"
              onDoubleClick={handleEditToggle}
            >
              {node.content || <span className="opacity-50 italic">Double click to edit</span>}
            </p>
          )}
        </div>

        {/* Connection Counter */}
        {node.relatedIds.length > 0 && (
          <div className="absolute -bottom-3 -right-3 w-7 h-7 bg-[var(--color-nebula-bg)] border border-white/20 rounded-full flex items-center justify-center text-xs font-bold text-[var(--color-nebula-fg)] shadow-lg z-10">
            {node.relatedIds.length}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-[var(--color-nebula-hairline-strong)] !border-2 !border-[var(--color-nebula-surface)] transition-transform hover:scale-150 z-10" />
    </>
  );
}

const nodeTypes: NodeTypes = {
  customNode: BrainstormNode,
};

function GraphBrainstormContent({
  nodes,
  rootId,
  onUpdateNode,
  onAddNode,
  onDeleteNode,
  onConnectNodes,
  onGenerateSuggestions,
  generatingFor,
  className,
}: GraphBrainstormProps) {
  
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<Node>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const newNodes = Object.values(nodes).map((node) => ({
      id: node.id,
      type: "customNode",
      position: { x: node.x, y: node.y },
      dragHandle: '.custom-drag-handle',
      data: {
        node,
        onAddChild: (type: NodeType) => {
          onAddNode(node.id, type, node.x, node.y + 250);
        },
        onGenerate: () => onGenerateSuggestions(node.id),
        onDelete: () => onDeleteNode(node.id),
        onUpdateContent: (content: string) => onUpdateNode(node.id, { content }),
        generatingFor,
      },
    }));
    setRfNodes(newNodes);
  }, [nodes, onAddNode, onGenerateSuggestions, onDeleteNode, onUpdateNode, generatingFor, setRfNodes]);

  useEffect(() => {
    const edges: Edge[] = [];
    Object.values(nodes).forEach((node) => {
      if (node.parentId && nodes[node.parentId]) {
        edges.push({
          id: `edge-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: "smoothstep",
          animated: false,
          style: { strokeWidth: 2 },
          className: "stroke-white/20 hover:stroke-white/50 cursor-pointer focus:stroke-white",
        });
      }
      node.relatedIds.forEach((relatedId) => {
        if (nodes[relatedId] && node.id < relatedId) {
          edges.push({
            id: `edge-${node.id}-${relatedId}-related`,
            source: node.id,
            target: relatedId,
            type: "bezier",
            animated: true,
            style: { strokeWidth: 2, strokeDasharray: '4,4' },
            className: "stroke-[var(--color-nebula-fg)]/60 hover:stroke-[var(--color-nebula-fg)] cursor-pointer focus:stroke-[var(--color-nebula-fg)]",
          });
        }
      });
    });
    setRfEdges(edges);
  }, [nodes, setRfEdges]);

  const onLayout = useCallback(() => {
    const layoutedNodes = getLayoutedElements(rfNodes, rfEdges);
    setRfNodes(layoutedNodes);
    layoutedNodes.forEach(node => {
      onUpdateNode(node.id, { x: node.position.x, y: node.position.y });
    });
    setTimeout(() => {
      fitView({ duration: 800, padding: 0.2 });
    }, 50);
  }, [rfNodes, rfEdges, setRfNodes, onUpdateNode, fitView]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    onUpdateNode(node.id, { x: node.position.x, y: node.position.y });
  }, [onUpdateNode]);

  const onConnect = useCallback((params: Connection) => {
    if (params.source && params.target && params.source !== params.target) {
      onConnectNodes(params.source, params.target);
    }
  }, [onConnectNodes]);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    edgesToDelete.forEach((edge) => {
      if (edge.id.includes('-related')) {
        const sourceNode = nodes[edge.source];
        if (sourceNode) {
          const newRelatedIds = sourceNode.relatedIds.filter((id) => id !== edge.target);
          onUpdateNode(edge.source, { relatedIds: newRelatedIds });
        }
      } else {
        onUpdateNode(edge.target, { parentId: null });
      }
    });
  }, [nodes, onUpdateNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type || !Object.keys(typeConfig).includes(type)) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Add new standalone node
    onAddNode(null, type, position.x, position.y);
  }, [screenToFlowPosition, onAddNode]);

  const handleLegendClick = useCallback((type: NodeType) => {
    // Find approximate center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const position = screenToFlowPosition({
      x: centerX,
      y: centerY,
    });

    // Add a slight random offset so multiple clicks don't perfectly overlap
    const offsetX = Math.random() * 40 - 20;
    const offsetY = Math.random() * 40 - 20;

    onAddNode(null, type, position.x + offsetX, position.y + offsetY);
  }, [screenToFlowPosition, onAddNode]);

  return (
    <div 
      className={cn("w-full h-full bg-[var(--color-nebula-bg)]", className)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={32} 
          size={1.5} 
          color="rgba(255, 255, 255, 0.05)" 
        />
        
        {/* Main Controls - Bottom Left */}
        <div className="absolute bottom-6 left-6 z-10 flex gap-4 items-end">
          <div className="flex flex-col gap-px bg-white/10 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <button onClick={() => zoomIn()} className="p-2.5 bg-[var(--color-nebula-surface)] hover:bg-white/10 transition-colors" title="Zoom In">
              <ZoomIn className="w-4 h-4 text-white/80" />
            </button>
            <button onClick={() => zoomOut()} className="p-2.5 bg-[var(--color-nebula-surface)] hover:bg-white/10 transition-colors" title="Zoom Out">
              <ZoomOut className="w-4 h-4 text-white/80" />
            </button>
            <button onClick={() => fitView({ duration: 800, padding: 0.2 })} className="p-2.5 bg-[var(--color-nebula-surface)] hover:bg-white/10 transition-colors" title="Fit View">
              <Maximize className="w-4 h-4 text-white/80" />
            </button>
          </div>
          
          <button
            onClick={onLayout}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--color-nebula-surface)] hover:bg-white/10 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md transition-colors text-sm font-medium text-white/90"
          >
            <LayoutTemplate className="w-4 h-4" />
            Auto Layout
          </button>
        </div>

        {/* Legend - Top Right - Now Draggable AND Clickable! */}
        <Panel position="top-right" className="bg-[var(--color-nebula-surface)]/80 backdrop-blur-md border border-[var(--color-nebula-hairline-strong)] rounded-2xl p-2 shadow-2xl mr-4 mt-4">
          <div className="flex gap-1">
            {Object.entries(typeConfig).map(([type, config]) => (
              <div 
                key={type} 
                className="flex items-center gap-2 cursor-grab active:cursor-grabbing hover:scale-105 transition-all p-2 rounded-lg hover:bg-white/10"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', type);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => handleLegendClick(type as NodeType)}
                title={`Drag or click to add ${config.label}`}
              >
                <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: config.color }} />
                <span className="text-xs font-medium text-[color:var(--color-ash)]">{config.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <MiniMap 
          nodeColor={(n) => {
            const realType = (n.data as any)?.node?.type as NodeType || "feature";
            return typeConfig[realType]?.color || "#fff";
          }}
          maskColor="rgba(0, 0, 0, 0.4)"
          className="!bg-[var(--color-nebula-surface)] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          style={{ width: 220, height: 160, bottom: 24, right: 24, margin: 0 }}
        />
      </ReactFlow>
    </div>
  );
}

export function GraphBrainstorm(props: GraphBrainstormProps) {
  return (
    <ReactFlowProvider>
      <GraphBrainstormContent {...props} />
    </ReactFlowProvider>
  );
}
