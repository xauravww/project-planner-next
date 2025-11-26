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

export function ArchitectureTabs({ projectId, architecture }: { projectId: string; architecture: any }) {
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
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                ? "bg-white/10 text-white"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <GlassCard>
                            <h3 className="text-lg font-semibold mb-4">System Architecture</h3>
                            {architecture?.content ? (
                                <MessageContent content={architecture.content} />
                            ) : (
                                <p className="text-gray-400">No architecture generated yet</p>
                            )}
                        </GlassCard>

                        {architecture?.systemDiagram && (
                            <GlassCard>
                                <h3 className="text-lg font-semibold mb-4">System Diagram</h3>
                                <Mermaid
                                    chart={architecture.systemDiagram}
                                    onFix={(error: string) => handleFixDiagram(error, "systemDiagram", architecture.systemDiagram)}
                                />
                            </GlassCard>
                        )}

                        {architecture?.highLevel && (
                            <GlassCard>
                                <h3 className="text-lg font-semibold mb-4">High-Level Architecture</h3>
                                <MessageContent content={architecture.highLevel} />
                            </GlassCard>
                        )}
                    </div>
                )}

                {/* Database Tab */}
                {activeTab === "database" && (
                    <div className="space-y-6">
                        {!architecture?.erDiagram ? (
                            <GlassCard className="text-center py-12">
                                <Database className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                                <h3 className="text-xl font-semibold mb-2">Database Schema Not Generated</h3>
                                <p className="text-gray-400 mb-6">
                                    Generate comprehensive database schema with ER diagram and table specifications
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("database")}
                                    disabled={isGenerating === "database"}
                                    className="bg-blue-500 hover:bg-blue-600"
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
                                    <h3 className="text-lg font-semibold mb-4">Entity-Relationship Diagram</h3>
                                    <Mermaid
                                        chart={architecture.erDiagram}
                                        onFix={(error) => handleFixDiagram(error, "erDiagram", architecture.erDiagram)}
                                    />
                                </GlassCard>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Database Tables</h3>
                                    {databaseTables.map((table) => (
                                        <GlassCard key={table.name}>
                                            <h4 className="text-md font-semibold text-blue-400 mb-2">{table.name}</h4>
                                            <p className="text-sm text-gray-400 mb-4">{table.description}</p>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-white/10">
                                                            <th className="text-left py-2 px-2">Field</th>
                                                            <th className="text-left py-2 px-2">Type</th>
                                                            <th className="text-left py-2 px-2">Constraints</th>
                                                            <th className="text-left py-2 px-2">Description</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {table.fields.map((field) => (
                                                            <tr key={field.name} className="border-b border-white/5">
                                                                <td className="py-2 px-2 font-mono text-blue-300">{field.name}</td>
                                                                <td className="py-2 px-2 text-gray-400">{field.type}</td>
                                                                <td className="py-2 px-2 text-xs text-gray-500">{field.constraints}</td>
                                                                <td className="py-2 px-2 text-gray-400">{field.description}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {table.indexes.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/10">
                                                    <p className="text-xs text-gray-500">
                                                        <span className="font-semibold">Indexes:</span> {table.indexes.join(", ")}
                                                    </p>
                                                </div>
                                            )}

                                            {table.relationships.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500">
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
                                <Code className="w-12 h-12 mx-auto mb-4 text-green-400" />
                                <h3 className="text-xl font-semibold mb-2">API Specification Not Generated</h3>
                                <p className="text-gray-400 mb-6">
                                    Generate comprehensive API documentation with endpoints and sequence diagrams
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("api")}
                                    disabled={isGenerating === "api"}
                                    className="bg-green-500 hover:bg-green-600"
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
                                    <h3 className="text-lg font-semibold">API Endpoints</h3>
                                    {apiEndpoints.map((endpoint, idx) => (
                                        <GlassCard key={idx}>
                                            <div className="flex items-start gap-4">
                                                <span className={`px-3 py-1 rounded text-xs font-bold ${endpoint.method === "GET" ? "bg-blue-500" :
                                                    endpoint.method === "POST" ? "bg-green-500" :
                                                        endpoint.method === "PUT" ? "bg-yellow-500" :
                                                            endpoint.method === "DELETE" ? "bg-red-500" :
                                                                "bg-gray-500"
                                                    }`}>
                                                    {endpoint.method}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-mono text-blue-300 mb-2">{endpoint.path}</p>
                                                    <p className="text-sm text-gray-400 mb-3">{endpoint.description}</p>

                                                    {endpoint.authentication && (
                                                        <p className="text-xs text-gray-500 mb-2">🔒 {endpoint.authentication}</p>
                                                    )}

                                                    <details className="mt-3">
                                                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
                                                            View Details
                                                        </summary>
                                                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-white/10">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Request Body:</p>
                                                                <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(endpoint.requestBody, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 mb-1">Success Response ({endpoint.responseSuccess.code}):</p>
                                                                <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(endpoint.responseSuccess.body, null, 2)}
                                                                </pre>
                                                            </div>
                                                            {endpoint.responseErrors.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 mb-1">Error Responses:</p>
                                                                    <ul className="text-xs space-y-1">
                                                                        {endpoint.responseErrors.map((err, i) => (
                                                                            <li key={i} className="text-red-400">
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
                                        <h3 className="text-lg font-semibold mb-4">{diag.name}</h3>
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
                                <Server className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                                <h3 className="text-xl font-semibold mb-2">Deployment Architecture Not Generated</h3>
                                <p className="text-gray-400 mb-6">
                                    Generate infrastructure diagram, scaling strategy, and security design
                                </p>
                                <Button
                                    onClick={() => handleGenerateSection("deployment")}
                                    disabled={isGenerating === "deployment"}
                                    className="bg-purple-500 hover:bg-purple-600"
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
                                    <h3 className="text-lg font-semibold mb-4">Infrastructure Diagram</h3>
                                    <Mermaid
                                        chart={architecture.deploymentDiagram}
                                        onFix={(error: string) => handleFixDiagram(error, "deploymentDiagram", architecture.deploymentDiagram)}
                                    />
                                </GlassCard>

                                {architecture?.scalingStrategy && (
                                    <GlassCard>
                                        <h3 className="text-lg font-semibold mb-4">Scaling Strategy</h3>
                                        <MessageContent content={architecture.scalingStrategy} />
                                    </GlassCard>
                                )}

                                {architecture?.securityDesign && (
                                    <GlassCard>
                                        <h3 className="text-lg font-semibold mb-4">Security Design</h3>
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
