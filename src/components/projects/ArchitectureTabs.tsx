"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Sparkles, Database, Code, Server, FileText } from "lucide-react";
import { MessageContent } from "@/components/chat/MessageContent";
import Mermaid from "@/components/ui/Mermaid";
import { generateDatabaseSection, generateAPISection, generateDeploymentSection, fixMermaidDiagram } from "@/actions/architecture-sections";
import { updateArchitecture } from "@/actions/crud";
import { toast } from "sonner";

type Tab = "overview" | "database" | "api" | "deployment";

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
        { id: "deployment", label: "Deployment", icon: Server },
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

    const databaseTables: DatabaseTable[] = architecture?.databaseSchema
        ? JSON.parse(architecture.databaseSchema)
        : [];

    const apiEndpoints: APIEndpoint[] = architecture?.apiSpec
        ? JSON.parse(architecture.apiSpec)
        : [];

    return (
        <div className="space-y-6 overflow-x-hidden w-full h-full p-4 sm:p-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 sm:gap-2 nebula-hairline-b pb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-[var(--r-md)] transition-all whitespace-nowrap border-b-2 ${activeTab === tab.id
                                ? "border-[var(--color-nebula-fg)] text-[color:var(--color-nebula-fg)]"
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
                                    <MessageContent content={architecture.content} />
                                ) : (
                                    <p className="type-body text-[color:var(--color-charcoal)]">No architecture generated yet</p>
                                )
                            )}
                        </GlassCard>

                        {architecture?.systemDiagram && (
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
                                <Mermaid
                                    chart={isEditing ? formData?.diagram : architecture.systemDiagram}
                                    onFix={(error: string) => handleFixDiagram(error, "systemDiagram", isEditing ? formData?.diagram : architecture.systemDiagram)}
                                />
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
                                    <MessageContent content={architecture?.highLevel || ""} />
                                )}
                            </GlassCard>
                        )}
                    </div>
                )}

                {/* Database Tab */}
                {activeTab === "database" && (
                    <div className="space-y-6">
                        {!architecture?.erDiagram ? (
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
                                    <Mermaid
                                        chart={architecture.erDiagram}
                                        onFix={(error) => handleFixDiagram(error, "erDiagram", architecture.erDiagram)}
                                    />
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

                                {architecture?.sequenceDiagrams && JSON.parse(architecture.sequenceDiagrams).map((diag: any, idx: number) => (
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
                                                    const diagrams = JSON.parse(architecture.sequenceDiagrams);
                                                    diagrams[idx].diagram = result.diagram;

                                                    const updateResult = await updateArchitecture(architecture.id, {
                                                        sequenceDiagrams: JSON.stringify(diagrams)
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
                                ))}
                            </>
                        )}
                    </div>
                )}

                {/* Deployment Tab */}
                {activeTab === "deployment" && (
                    <div className="space-y-6">
                        {!architecture?.deploymentDiagram ? (
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
                                        chart={architecture.deploymentDiagram}
                                        onFix={(error: string) => handleFixDiagram(error, "deploymentDiagram", architecture.deploymentDiagram)}
                                    />
                                </GlassCard>

                                {architecture?.scalingStrategy && (
                                    <GlassCard>
                                        <h3 className="type-h4 mb-4">Scaling Strategy</h3>
                                        <MessageContent content={architecture.scalingStrategy} />
                                    </GlassCard>
                                )}

                                {architecture?.securityDesign && (
                                    <GlassCard>
                                        <h3 className="type-h4 mb-4">Security Design</h3>
                                        <MessageContent content={architecture.securityDesign} />
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
