"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Sparkles, Database, Code, Server as ServerIcon, FileText, Layers, Download, Copy, Check, Code2, Image, Settings } from "lucide-react";
import { MessageContent } from "@/components/chat/MessageContent";
import Mermaid from "@/components/ui/Mermaid";
import { generateDatabaseSection, generateAPISection, generateDeploymentSection, fixMermaidDiagram } from "@/actions/architecture-sections";
import { generateHLD, generateLLD, approveHLD, approveLLD } from "@/actions/project";
import { updateArchitecture } from "@/actions/crud";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Zap, Layout, GitBranch, Server, Hexagon } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "database" | "api" | "components" | "deployment";

interface DatabaseTable {
    name: string;
    description: string;
    fields: Array<{
        name: string;
        type: string;
        constraints: string;
        description: string;
    }>;
    indexes: string[];
    relationships: Array<{
        table: string;
        type: string;
        foreignKey: string;
    }>;
}

interface APIEndpoint {
    method: string;
    path: string;
    description: string;
    authentication: string;
    requestBody: Record<string, string>;
    responseSuccess: { code: number; body: any };
    responseErrors: Array<{ code: number; message: string }>;
}

// Helper to parse content that might be JSON-wrapped (handles nested JSON)
const parseContent = (content: string | null | undefined, depth = 0): string => {
    if (!content) return "";
    if (depth > 3) return content; // Prevent infinite recursion
    
    const trimmed = content.trim();
    if (!trimmed) return "";
    
    // If it doesn't start with { or [, it's not JSON
    if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return trimmed;
    }
    
    try {
        const parsed = JSON.parse(trimmed);
        
        // If it's an array, return formatted
        if (Array.isArray(parsed)) {
            return parsed.map(item => typeof item === "string" ? item : JSON.stringify(item)).join("\n\n");
        }
        
        // If it's an object, check for content field
        if (typeof parsed === "object" && parsed !== null) {
            // If content field exists and is a string, recursively parse it
            if (parsed.content && typeof parsed.content === "string") {
                // Check if content itself is JSON
                const contentTrimmed = parsed.content.trim();
                if (contentTrimmed.startsWith("{") || contentTrimmed.startsWith("[")) {
                    return parseContent(contentTrimmed, depth + 1);
                }
                return parsed.content;
            }
            
            // Look for other common content fields
            const contentFields = ["text", "description", "body", "overview", "details"];
            for (const field of contentFields) {
                if (parsed[field] && typeof parsed[field] === "string") {
                    return parsed[field];
                }
            }
            
            // If no content field found, but has highLevel/lowLevel, format nicely
            if (parsed.highLevel || parsed.lowLevel || parsed.functionalDecomposition) {
                const parts = [];
                if (parsed.highLevel) parts.push(`## High-Level Architecture\n\n${parsed.highLevel}`);
                if (parsed.lowLevel) parts.push(`## Low-Level Details\n\n${parsed.lowLevel}`);
                if (parsed.functionalDecomposition) parts.push(`## Functional Decomposition\n\n${parsed.functionalDecomposition}`);
                return parts.join("\n\n");
            }
            
            // Otherwise format the object nicely
            return Object.entries(parsed)
                .filter(([_, value]) => typeof value === "string" && value.trim())
                .map(([key, value]) => `**${key}**: ${value}`)
                .join("\n\n");
        }
        
        return String(parsed);
    } catch {
        // Not valid JSON, return cleaned text
        return trimmed;
    }
};



// Skeleton loaders for progressive loading
function SkeletonCard() {


    // Generate LLD for a specific container
        return (
        <GlassCard className="animate-pulse">
            <div className="h-4 bg-[var(--color-nebula-hairline)] rounded w-3/4 mb-4" />
            <div className="space-y-3">
                <div className="h-4 bg-[var(--color-nebula-hairline)] rounded w-full" />
                <div className="h-4 bg-[var(--color-nebula-hairline)] rounded w-5/6" />
                <div className="h-4 bg-[var(--color-nebula-hairline)] rounded w-2/3" />
            </div>
        </GlassCard>
    );
}

function SkeletonMermaid() {


    // Generate LLD for a specific container
        return (
        <GlassCard className="animate-pulse">
            <div className="h-4 bg-[var(--color-nebula-hairline)] rounded w-2/4 mb-4" />
            <div className="aspect-video bg-[var(--color-nebula-hairline)] rounded" />
        </GlassCard>
    );
}

function SkeletonDiagram({ title }: { title: string }) {


    // Generate LLD for a specific container
        return (
        <GlassCard className="animate-pulse">
            <div className="h-5 bg-[var(--color-nebula-hairline)] rounded w-1/3 mb-4" />
            <div className="aspect-video bg-[var(--color-nebula-hairline)] rounded" />
        </GlassCard>
    );
}

// HLD Review Gate Component
function HLDReviewGate({ architecture, projectId, onApprove, onRequestChanges }: { 
    architecture: any; 
    projectId: string;
    onApprove: () => void;
    onRequestChanges: () => void;
}) {
    const hldStatus = architecture?.hldStatus || "draft";
    const containers = architecture?.containers ? JSON.parse(architecture.containers) : [];
    const hasContainers = containers.length > 0;
    const hasContextDiagram = !!architecture?.contextDiagram;
    const hasContainerDiagram = !!architecture?.containerDiagram;
    const hasDataFlow = !!architecture?.hldDataFlowDiagram;
    const hasDynamic = !!architecture?.dynamicDiagram;
    const hasDeploymentTopology = !!architecture?.deploymentTopology;
    const hasADRs = architecture?.adrs && JSON.parse(architecture.adrs).length > 0;
    
    const isComplete = hasContainers && hasContextDiagram && hasContainerDiagram;
    
    if (hldStatus === "approved") return null;
    if (hldStatus === "draft" && !isComplete) return null;



    // Generate LLD for a specific container
        return (
        <GlassCard className="border-[var(--color-accent-yellow)] bg-[var(--color-accent-yellow-glow)]">
            <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[var(--color-accent-yellow)]/20 border border-[var(--color-accent-yellow)]">
                    <Zap className="w-5 h-5 text-[var(--color-accent-yellow)]" />
                </div>
                <div className="flex-1">
                    <h3 className="type-h4 text-[var(--color-accent-yellow)]">HLD Ready for Review</h3>
                    <p className="type-small text-[color:var(--color-charcoal)] mt-1">
                        High-Level Design has been generated. Review the diagrams below before proceeding to Low-Level Design.
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <HLDCheckItem label="Containers" status={hasContainers} count={containers.length} />
                        <HLDCheckItem label="Context Diagram" status={hasContextDiagram} />
                        <HLDCheckItem label="Container Diagram" status={hasContainerDiagram} />
                        <HLDCheckItem label="Data Flow" status={hasDataFlow} />
                        <HLDCheckItem label="Dynamic/Sequence" status={hasDynamic} />
                        <HLDCheckItem label="Deployment Topology" status={hasDeploymentTopology} />
                        <HLDCheckItem label="ADRs" status={hasADRs} />
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                        <Button 
                            variant="nebula" 
                            onClick={onApprove}
                            disabled={!isComplete}
                            className="flex-1"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve & Continue to LLD
                        </Button>
                        <Button 
                            variant="nebula-ghost" 
                            onClick={onRequestChanges}
                            className="flex-1 border-[var(--color-accent-yellow)] text-[var(--color-accent-yellow)] hover:bg-[var(--color-accent-yellow-glow)]"
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Request Changes
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}

function HLDCheckItem({ label, status, count }: { label: string; status: boolean; count?: number }) {


    // Generate LLD for a specific container
        return (
        <div className={`p-3 rounded-lg text-center ${
            status ? "bg-[var(--color-accent-green)]/10 border border-[var(--color-accent-green)]/30" 
                   : "bg-[var(--color-nebula-surface)] border border-[var(--color-nebula-hairline-strong)]"
        }`}>
            <div className={`flex items-center justify-center gap-1 mb-1 ${
                status ? "text-[var(--color-accent-green)]" : "text-[color:var(--color-ash)]"
            }`}>
                {status ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {count !== undefined && <span className="text-xs">({count})</span>}
            </div>
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}



// Diagram Export Dropdown
function DiagramExportMenu({ diagramCode, title, type = "mermaid" }: { 
    diagramCode: string; 
    title: string;
    type?: "mermaid" | "plantuml" | "openapi";
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const exportMermaid = () => {
        const blob = new Blob([diagramCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.mmd`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPlantUML = () => {
        // Convert Mermaid to PlantUML (basic conversion)
        const plantUML = `@startuml
${diagramCode}
@enduml`;
        const blob = new Blob([plantUML], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.puml`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPNG = () => {
        // Open in mermaid.live for PNG export
        const encoded = encodeURIComponent(diagramCode);
        window.open(`https://mermaid.live/edit#pako:${encoded}`, "_blank");
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(diagramCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <Button
                variant="nebula-ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="text-[color:var(--color-ash)] hover:text-[color:var(--color-nebula-fg)]"
            >
                <Settings className="w-4 h-4" />
            </Button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 GlassCard rounded-xl border border-[var(--color-nebula-hairline-strong)] py-1 min-w-[180px] shadow-lg">
                        <div className="px-3 py-2 border-b border-[var(--color-nebula-hairline-strong)] text-xs text-[color:var(--color-ash)]">
                            Export: {title}
                        </div>
                        <button
                            onClick={exportMermaid}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]"
                        >
                            <FileText className="w-4 h-4" />
                            Mermaid (.mmd)
                        </button>
                        <button
                            onClick={exportPlantUML}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]"
                        >
                            <Code2 className="w-4 h-4" />
                            PlantUML (.puml)
                        </button>
                        <button
                            onClick={exportPNG}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]"
                        >
                            <Image className="w-4 h-4" />
                            PNG via Mermaid Live
                        </button>
                        <div className="border-t border-[var(--color-nebula-hairline-strong)] my-1" />
                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--color-nebula-surface)] text-[color:var(--color-nebula-fg)]"
                        >
                            <Copy className="w-4 h-4" />
                            {copied ? (
                                <>Copied! <Check className="w-4 h-4 text-[var(--color-accent-green)]" /></>
                            ) : (
                                <>Copy to Clipboard</>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export function ArchitectureTabs({
    projectId,
    architecture,
    isEditing = false,
    formData,
    onFormChange
}: {
    projectId: string;
    architecture: any;
    isEditing?: boolean;
    formData?: any;
    onFormChange?: (field: string, value: string) => void;
}) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const handleFixDiagram = async (error: string, diagramType: string, currentCode: string) => {
        toast.loading("Fixing diagram with AI...");
        try {
            const result = await fixMermaidDiagram(currentCode, error);
            if (result.error || !result.diagram) {
                toast.error(result.error || "Failed to fix diagram");
                return;
            }

            // Save the fixed diagram
            const updateResult = await updateArchitecture(architecture.id, {
                [diagramType]: result.diagram
            });

            if (updateResult.error) {
                toast.error("Failed to save fixed diagram");
            } else {
                toast.success("Diagram fixed and saved!");
                window.location.reload();
            }
        } catch (error) {
            toast.error("An error occurred while fixing the diagram");
        } finally {
            toast.dismiss();
        }
    };

    const tabs: Array<{ id: Tab; label: string; icon: any }> = [
        { id: "overview", label: "Overview", icon: FileText },
        { id: "database", label: "Database", icon: Database },
        { id: "api", label: "API", icon: Code },
        { id: "components", label: "Components", icon: Layers },
        { id: "deployment", label: "Deployment", icon: ServerIcon },
    ];

    const handleGenerateSection = async (section: "database" | "api" | "deployment") => {
        setIsGenerating(section);
        try {
            let result;
            if (section === "database") result = await generateDatabaseSection(projectId);
            else if (section === "api") result = await generateAPISection(projectId);
            else result = await generateDeploymentSection(projectId);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} section generated!`);
                window.location.reload();
            }
        } catch (error) {
            toast.error("Failed to generate section");
        } finally {
            setIsGenerating(null);
        }
    };

    // Generate LLD for a specific container
    const handleGenerateLLDForContainer = async (containerId: string) => {
        setIsGenerating(`components-${containerId}`);
        try {
            const result = await generateLLD(projectId, containerId);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Components generated for container!`);
                window.location.reload();
            }
        } catch (error) {
            toast.error("Failed to generate components");
        } finally {
            setIsGenerating(null);
        }
    };

    // Generate components for all containers
    const handleGenerateComponents = async () => {
        setIsGenerating("components");
        try {
            const containers = architecture.containers ? JSON.parse(architecture.containers) : [];
            for (const container of containers) {
                setIsGenerating(`components-${container.id}`);
                const result = await generateLLD(projectId, container.id);
                if (result.error) {
                    toast.error(`Failed for ${container.name}: ${result.error}`);
                } else {
                    toast.success(`Generated for ${container.name}`);
                }
            }
            setIsGenerating("components");
            toast.success("All containers processed!");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to generate components");
        } finally {
            setIsGenerating(null);
        }
    };

    // Safely parse database schema with error handling
    const databaseTables: DatabaseTable[] = (() => {
        if (!architecture?.databaseSchema) return [];
        try {
            const parsed = JSON.parse(architecture.databaseSchema);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            console.error("Failed to parse database schema");
            return [];
        }
    })();

    // Safely parse API spec with error handling
    const apiEndpoints: APIEndpoint[] = (() => {
        if (!architecture?.apiSpec) return [];
        try {
            const parsed = JSON.parse(architecture.apiSpec);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            console.error("Failed to parse API spec");
            return [];
        }
    })();



    // Generate LLD for a specific container
        return (
        <div className="space-y-6 overflow-x-hidden w-full h-full p-4 sm:p-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 sm:gap-2 nebula-hairline-b pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                

    // Generate LLD for a specific container
        return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--r-md)] transition-all whitespace-nowrap border-b border-[var(--color-nebula-hairline-strong)] ${activeTab === tab.id
                                ? "border-[color:var(--color-accent-orange)] text-[color:var(--color-nebula-fg)]"
                                : "border-transparent text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)]"
                                }`}
                        >
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6 overflow-x-hidden w-full max-w-full">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="type-h4 mb-4">System Architecture</h3>
                            {isEditing ? (
                                <textarea
                                    className="w-full h-64 bg-[var(--color-surface-deep)] text-[color:var(--color-nebula-fg)] rounded-[var(--r-md)] p-4 border border-[var(--color-nebula-hairline-strong)] focus:border-[var(--color-nebula-fg)] outline-none text-mono text-sm resize-y"
                                    value={formData?.content || ""}
                                    onChange={(e) => onFormChange?.("content", e.target.value)}
                                    placeholder="Enter system architecture overview..."
                                />
                            ) : (
                                architecture?.content ? (
                                    <MessageContent content={parseContent(architecture.content)} />
                                ) : (
                                    <p className="type-body text-[color:var(--color-charcoal)]">No architecture generated yet</p>
                                )
                            )}
                        </GlassCard>

                        {architecture?.legacySystemDiagram && (
                            <GlassCard>
                                <h3 className="type-h4 mb-4">System Diagram</h3>
                                {isEditing ? (
                                    <textarea
                                        className="w-full h-64 bg-[var(--color-surface-deep)] text-[color:var(--color-nebula-fg)] rounded-[var(--r-md)] p-4 border border-[var(--color-nebula-hairline-strong)] focus:border-[var(--color-nebula-fg)] outline-none text-mono text-sm resize-y mb-4"
                                        value={formData?.diagram || ""}
                                        onChange={(e) => onFormChange?.("diagram", e.target.value)}
                                        placeholder="Enter Mermaid diagram code..."
                                    />
                                ) : null}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-end p-2">
                                        <DiagramExportMenu diagramCode={isEditing ? formData?.diagram : architecture.legacySystemDiagram} title="System Diagram" />
                                    </div>
                                    <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
                                        <Mermaid
                                            chart={isEditing ? formData?.diagram : architecture.legacySystemDiagram}
                                            onFix={(error: string) => handleFixDiagram(error, "legacySystemDiagram", isEditing ? formData?.diagram : architecture.legacySystemDiagram)}
                                        />
                                    </div>
                                </div>
                            </GlassCard>
                        )}

                        {(architecture?.highLevel || isEditing) && (
                            <GlassCard>
                                <h3 className="type-h4 mb-4">High-Level Architecture</h3>
                                {isEditing ? (
                                    <textarea
                                        className="w-full h-48 bg-[var(--color-surface-deep)] text-[color:var(--color-nebula-fg)] rounded-[var(--r-md)] p-4 border border-[var(--color-nebula-hairline-strong)] focus:border-[var(--color-nebula-fg)] outline-none text-mono text-sm resize-y"
                                        value={formData?.highLevel || ""}
                                        onChange={(e) => onFormChange?.("highLevel", e.target.value)}
                                        placeholder="Enter high-level architecture details..."
                                    />
                                ) : (
                                    <MessageContent content={parseContent(architecture?.highLevel)} />
                                )}
                            </GlassCard>
                        )}
                    </div>
                )}

                {/* Database Tab */}
                {activeTab === "database" && (
                    <div className="space-y-6">
                        {!architecture?.legacyErDiagram ? (
                            <GlassCard className="text-center py-12">
                                <Database className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-nebula-fg)]" />
                                <h3 className="type-h3 mb-2">Database Schema Not Generated</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] mb-6">
                                    Generate comprehensive database schema with ER diagram and table specifications
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("database")}
                                    disabled={isGenerating === "database"}
                                    variant="nebula"
                                >
                                    {isGenerating === "database" ? (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Database Schema
                                        </>
                                    )}
                                </Button>
                            </GlassCard>
                        ) : (
                            <>
                                <GlassCard>
                                    <h3 className="type-h4 mb-4">Entity-Relationship Diagram</h3>
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center justify-end p-2">
                                            <DiagramExportMenu diagramCode={architecture.legacyErDiagram} title="ER Diagram" />
                                        </div>
                                        <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
                                            <Mermaid
                                                chart={architecture.legacyErDiagram}
                                                onFix={(error) => handleFixDiagram(error, "legacyErDiagram", architecture.legacyErDiagram)}
                                            />
                                        </div>
                                    </div>
                                </GlassCard>

                                <div className="space-y-4">
                                    <h3 className="type-h4">Database Tables</h3>
                                    {databaseTables.map((table) => (
                                        <GlassCard key={table.name}>
                                            <h4 className="type-h4 text-[color:var(--color-nebula-fg)] mb-2">{table.name}</h4>
                                            <p className="type-small text-[color:var(--color-charcoal)] mb-4">{table.description}</p>

                                            <div className="overflow-x-auto max-w-full">
                                                <table className="w-full text-sm min-w-[600px] border-collapse">
                                                    <thead>
                                                        <tr className="nebula-hairline-b text-xs uppercase tracking-wider text-[color:var(--color-ash)] text-mono">
                                                            <th className="text-left py-3 px-3 font-medium">Field</th>
                                                            <th className="text-left py-3 px-3 font-medium">Type</th>
                                                            <th className="text-left py-3 px-3 font-medium">Constraints</th>
                                                            <th className="text-left py-3 px-3 font-medium">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-mono text-xs">
                                                        {table.fields.map((field) => (
                                                            <tr key={field.name} className="nebula-hairline-b hover:bg-[var(--color-surface-elevated)] transition-colors">
                                                                <td className="py-3 px-3 text-[color:var(--color-nebula-fg)] font-semibold">{field.name}</td>
                                                                <td className="py-3 px-3 text-[color:var(--color-accent-green)]">{field.type}</td>
                                                                <td className="py-3 px-3 text-[color:var(--color-accent-yellow)]">{field.constraints}</td>
                                                                <td className="py-3 px-3 text-[color:var(--color-charcoal)] font-sans">{field.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {table.indexes.length > 0 && (
                                                <div className="mt-4 pt-4 nebula-hairline-t">
                                                    <p className="text-xs text-[color:var(--color-ash)]">
                                                        <span className="font-semibold">Indexes:</span> {table.indexes.join(", ")}
                                                    </p>
                                                </div>
                                            )}

                                            {table.relationships.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-[color:var(--color-ash)]">
                                                        <span className="font-semibold">Relationships:</span>{" "}
                                                        {table.relationships.map(r => `${r.type} → ${r.table}`).join(", ")}
                                                    </p>
                                                </div>
                                            )}
                                        </GlassCard>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* API Tab */}
                {activeTab === "api" && (
                    <div className="space-y-6">
                        {!architecture?.apiSpec ? (
                            <GlassCard className="text-center py-12">
                                <Code className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-accent-green)]" />
                                <h3 className="type-h3 mb-2">API Specification Not Generated</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] mb-6">
                                    Generate comprehensive API documentation with endpoints and sequence diagrams
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("api")}
                                    disabled={isGenerating === "api"}
                                    variant="nebula"
                                >
                                    {isGenerating === "api" ? (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate API Specification
                                        </>
                                    )}
                                </Button>
                            </GlassCard>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    <h3 className="type-h4">API Endpoints</h3>
                                    {apiEndpoints.map((endpoint, idx) => (
                                        <GlassCard key={idx}>
                                            <div className="flex items-start gap-4">
                                                <span className={`px-3 py-1 rounded text-xs font-bold text-[color:var(--color-on-light)] ${endpoint.method === "GET" ? "bg-[var(--color-nebula-fg)]" :
                                                    endpoint.method === "POST" ? "bg-[var(--color-accent-green)]" :
                                                        endpoint.method === "PUT" ? "bg-[var(--color-accent-yellow)]" :
                                                            endpoint.method === "DELETE" ? "bg-[var(--color-accent-red)]" :
                                                                "bg-[var(--color-surface-elevated)]"
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-mono text-[color:var(--color-nebula-fg)] mb-2">{endpoint.path}</p>
                                                    <p className="type-small text-[color:var(--color-charcoal)] mb-3">{endpoint.description}</p>

                                                    {endpoint.authentication && (
                                                        <p className="text-xs text-[color:var(--color-ash)] mb-2">🔒 {endpoint.authentication}</p>
                                                    )}

                                                    <details className="mt-3">
                                                        <summary className="cursor-pointer text-sm text-[color:var(--color-charcoal)] hover:text-[color:var(--color-nebula-fg)]">
                                                            View Details
                                                        </summary>
                                                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-[var(--color-nebula-hairline-strong)]">
                                                            <div>
                                                                <p className="text-xs font-semibold text-[color:var(--color-ash)] mb-1">Request Body:</p>
                                                                <pre className="text-mono text-xs text-[color:var(--color-nebula-fg-soft)] bg-[var(--color-surface-deep)] p-2 rounded-[var(--r-lg)] overflow-x-auto max-w-full">
                                                                    {JSON.stringify(endpoint.requestBody, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-[color:var(--color-ash)] mb-1">Success Response ({endpoint.responseSuccess.code}):</p>
                                                                <pre className="text-mono text-xs text-[color:var(--color-nebula-fg-soft)] bg-[var(--color-surface-deep)] p-2 rounded-[var(--r-lg)] overflow-x-auto max-w-full">
                                                                    {JSON.stringify(endpoint.responseSuccess.body, null, 2)}
                                                                </pre>
                                                            </div>
                                                            {endpoint.responseErrors.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-[color:var(--color-ash)] mb-1">Error Responses:</p>
                                                                    <ul className="text-xs space-y-1">
                                                                        {endpoint.responseErrors.map((err, i) => (
                                                                            <li key={i} className="text-[color:var(--color-accent-red)]">
                                                                                {err.code}: {err.message}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </details>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>

                                {(() => {
                                    if (!architecture?.legacySequenceDiagrams) return null;
                                    let diagrams: any[] = [];
                                    try {
                                        diagrams = JSON.parse(architecture.legacySequenceDiagrams);
                                        if (!Array.isArray(diagrams)) return null;
                                    } catch {
                                        console.error("Failed to parse sequence diagrams");
                                        return null;
                                    }
                                    return diagrams.map((diag: any, idx: number) => (
                                    <GlassCard key={idx}>
                                        <h3 className="type-h4 mb-4">{diag.name}</h3>
                                        <Mermaid
                                            chart={diag.diagram}
                                            onFix={async (error: string) => {
                                                toast.loading("Fixing diagram with AI...");
                                                try {
                                                    const result = await fixMermaidDiagram(diag.diagram, error);
                                                    if (result.error || !result.diagram) {
                                                        toast.error(result.error || "Failed to fix diagram");
                                                        return;
                                                    }

                                                    // Update specific diagram in the array
                                                    const diagrams = JSON.parse(architecture.legacySequenceDiagrams);
                                                    diagrams[idx].diagram = result.diagram;

                                                    const updateResult = await updateArchitecture(architecture.id, {
                                                        lldSequenceDiagrams: JSON.stringify(diagrams)
                                                    });

                                                    if (updateResult.error) {
                                                        toast.error("Failed to save fixed diagram");
                                                    } else {
                                                        toast.success("Diagram fixed and saved!");
                                                        window.location.reload();
                                                    }
                                                } catch (error) {
                                                    toast.error("An error occurred while fixing the diagram");
                                                } finally {
                                                    toast.dismiss();
                                                }
                                            }}
                                        />
                                    </GlassCard>
                                )); })()}
                            </>
                        )}
                    </div>
                )}



                {/* Components Tab */}
                {activeTab === "components" && (
                    <div className="space-y-6">
                        {(() => {
                            if (!architecture?.components) return (
                                <GlassCard className="text-center py-12">
                                    <Layers className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-accent-orange)]" />
                                    <h3 className="type-h3 mb-2">Component Design Not Generated</h3>
                                    <p className="type-body text-[color:var(--color-charcoal)] mb-6">
                                        Generate detailed component diagrams, class models, and API sequences for each service
                                    </p>
                                    <Button
                                        onClick={() => handleGenerateComponents()}
                                        disabled={isGenerating === "components"}
                                        variant="nebula"
                                    >
                                        {isGenerating === "components" ? (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                                Generating Components...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4 mr-2" />
                                                Generate Components
                                            </>
                                        )}
                                    </Button>
                                </GlassCard>
                            );

                            const containers = architecture.containers ? JSON.parse(architecture.containers) : [];
                            if (containers.length === 0) return (
                                <GlassCard className="text-center py-12">
                                    <Layers className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-accent-orange)]" />
                                    <h3 className="type-h3 mb-2">No Containers Defined</h3>
                                    <p className="type-body text-[color:var(--color-charcoal)] mb-6">
                                        Generate HLD first to define containers, then generate components for each.
                                    </p>
                                    <Button variant="nebula-ghost" onClick={() => setActiveTab("overview")}>
                                        Go to Overview
                                    </Button>
                                </GlassCard>
                            );

                        

    // Generate LLD for a specific container
        return (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="type-h3">Components ({containers.length} containers)</h3>
                                        <Button
                                            onClick={() => handleGenerateComponents()}
                                            disabled={isGenerating === "components"}
                                            variant="nebula"
                                        >
                                            {isGenerating === "components" ? (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                                    Regenerating All...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Regenerate All Components
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {containers.map((container: any) => {
                                            const containerId = container.id;
                                            const classDiagrams = architecture.classDiagrams ? JSON.parse(architecture.classDiagrams) : {};
                                            const sequences = architecture.lldSequenceDiagrams ? JSON.parse(architecture.lldSequenceDiagrams) : {};
                                            const activities = architecture.activityDiagrams ? JSON.parse(architecture.activityDiagrams) : {};
                                            const states = architecture.stateMachines ? JSON.parse(architecture.stateMachines) : {};
                                            const timing = architecture.timingDiagrams ? JSON.parse(architecture.timingDiagrams) : {};
                                            const apiContracts = architecture.apiContracts ? JSON.parse(architecture.apiContracts) : {};

                                            const hasClassDiagram = classDiagrams[containerId];
                                            const hasSequences = sequences[containerId] && sequences[containerId].length > 0;
                                            const hasActivities = activities[containerId] && activities[containerId].length > 0;
                                            const hasStates = states[containerId] && states[containerId].length > 0;
                                            const hasTiming = timing[containerId] && timing[containerId].length > 0;
                                            const hasApiContract = apiContracts[containerId];

                                        

    // Generate LLD for a specific container
        return (
                                                <GlassCard key={containerId} className="flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h4 className="type-h4">{container.name}</h4>
                                                            <p className="type-small text-[color:var(--color-charcoal)]">{container.type} • {container.technology}</p>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            hasClassDiagram || hasSequences || hasActivities 
                                                                ? "bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] border border-[var(--color-accent-green)]/30"
                                                                : "bg-[var(--color-nebula-surface)] text-[color:var(--color-ash)] border border-[var(--color-nebula-hairline-strong)]"
                                                        }`}>
                                                            {hasClassDiagram || hasSequences || hasActivities ? "Generated" : "Pending"}
                                                        </span>
                                                    </div>

                                                    <div className="flex-1 space-y-3 overflow-y-auto">
                                                        {/* Class Diagram */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasClassDiagram 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">Class Diagram</span>
                                                                <Button
                                                                    variant={hasClassDiagram ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasClassDiagram ? (
                                                                        <>
                                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                                            View
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Zap className="w-3 h-3 mr-1" />
                                                                            Generate
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </div>
                                                            {hasClassDiagram && (
                                                                <div className="h-48 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] flex flex-col">
                                                                    <div className="flex items-center justify-end p-2">
                                                                        <DiagramExportMenu diagramCode={classDiagrams[containerId]} title={`${container.name} Class Diagram`} />
                                                                    </div>
                                                                    <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
                                                                        <Mermaid chart={classDiagrams[containerId]} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Sequence Diagrams */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasSequences 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">Sequences ({sequences[containerId]?.length || 0})</span>
                                                                <Button
                                                                    variant={hasSequences ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasSequences ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                            {hasSequences && sequences[containerId]?.map((seq: any, i: number) => (
                                                                <div key={i} className="h-32 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] flex flex-col overflow-hidden">
                                                                    <div className="flex items-center justify-end p-1">
                                                                        <DiagramExportMenu diagramCode={seq.diagram} title={`${container.name} Sequence ${i + 1}`} />
                                                                    </div>
                                                                    <div className="flex-1 flex items-center justify-center p-1 overflow-auto">
                                                                        <Mermaid chart={seq.diagram} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Activity Diagrams */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasActivities 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">Activities ({activities[containerId]?.length || 0})</span>
                                                                <Button
                                                                    variant={hasActivities ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasActivities ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                            {hasActivities && activities[containerId]?.map((act: any, i: number) => (
                                                                <div key={i} className="h-32 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] flex flex-col overflow-hidden">
                                                                    <div className="flex items-center justify-end p-1">
                                                                        <DiagramExportMenu diagramCode={act.diagram} title={`${container.name} Activity ${i + 1}`} />
                                                                    </div>
                                                                    <div className="flex-1 flex items-center justify-center p-1 overflow-auto">
                                                                        <Mermaid chart={act.diagram} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* State Machines */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasStates 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">State Machines ({states[containerId]?.length || 0})</span>
                                                                <Button
                                                                    variant={hasStates ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasStates ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                            {hasStates && states[containerId]?.map((st: any, i: number) => (
                                                                <div key={i} className="h-32 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] flex flex-col overflow-hidden">
                                                                    <div className="flex items-center justify-end p-1">
                                                                        <DiagramExportMenu diagramCode={st.diagram} title={`${container.name} State Machine ${i + 1}`} />
                                                                    </div>
                                                                    <div className="flex-1 flex items-center justify-center p-1 overflow-auto">
                                                                        <Mermaid chart={st.diagram} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Timing Diagrams */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasTiming 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">Timing/SLA ({timing[containerId]?.length || 0})</span>
                                                                <Button
                                                                    variant={hasTiming ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasTiming ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                            {hasTiming && timing[containerId]?.map((t: any, i: number) => (
                                                                <div key={i} className="h-32 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] flex flex-col overflow-hidden">
                                                                    <div className="flex items-center justify-end p-1">
                                                                        <DiagramExportMenu diagramCode={t.diagram} title={`${container.name} Timing ${i + 1}`} />
                                                                    </div>
                                                                    <div className="flex-1 flex items-center justify-center p-1 overflow-auto">
                                                                        <Mermaid chart={t.diagram} />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* API Contract */}
                                                        <div className={`p-3 rounded-lg border transition-all ${
                                                            hasApiContract 
                                                                ? "border-[var(--color-accent-green)]/30 bg-[var(--color-accent-green)]/5" 
                                                                : "border-[var(--color-nebula-hairline-strong)] bg-[var(--color-nebula-surface)]"
                                                        }`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="type-small font-medium">API Contract</span>
                                                                <Button
                                                                    variant={hasApiContract ? "nebula" : "nebula-ghost"}
                                                                    size="sm"
                                                                    onClick={() => handleGenerateLLDForContainer(containerId)}
                                                                    disabled={isGenerating === `components-${containerId}`}
                                                                >
                                                                    {hasApiContract ? <CheckCircle2 className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                                                </Button>
                                                            </div>
                                                            {hasApiContract && (
                                                                <div className="h-48 bg-[var(--color-surface-deep)] rounded border border-[var(--color-nebula-hairline-strong)] overflow-auto p-2 text-xs font-mono">
                                                                    <pre>{JSON.stringify(apiContracts[containerId], null, 2)}</pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Deployment Tab */}
                {activeTab === "deployment" && (
                    <div className="space-y-6">
                        {!architecture?.legacyDeploymentDiagram ? (
                            <GlassCard className="text-center py-12">
                                <Server className="w-12 h-12 mx-auto mb-4 text-[color:var(--color-nebula-fg)]" />
                                <h3 className="type-h3 mb-2">Deployment Architecture Not Generated</h3>
                                <p className="type-body text-[color:var(--color-charcoal)] mb-6">
                                    Generate infrastructure diagram, scaling strategy, and security design
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("deployment")}
                                    disabled={isGenerating === "deployment"}
                                    variant="nebula"
                                >
                                    {isGenerating === "deployment" ? (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate Deployment Architecture
                                        </>
                                    )}
                                </Button>
                            </GlassCard>
                        ) : (
                            <>
                                <GlassCard>
                                    <h3 className="type-h4 mb-4">Infrastructure Diagram</h3>
                                    <Mermaid
                                        chart={architecture.legacyDeploymentDiagram}
                                        onFix={(error: string) => handleFixDiagram(error, "legacyDeploymentDiagram", architecture.legacyDeploymentDiagram)}
                                    />
                                </GlassCard>

                                {architecture?.scalingStrategy && (
                                    <GlassCard>
                                        <h3 className="type-h4 mb-4">Scaling Strategy</h3>
                                        <MessageContent content={parseContent(architecture.scalingStrategy)} />
                                    </GlassCard>
                                )}

                                {architecture?.securityDesign && (
                                    <GlassCard>
                                        <h3 className="type-h4 mb-4">Security Design</h3>
                                        <MessageContent content={parseContent(architecture.securityDesign)} />
                                    </GlassCard>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
