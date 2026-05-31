import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const checks = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        checks: {
            database: { status: "unknown", latency: 0 },
            embedding_service: { status: "unknown", latency: 0 },
            ai_service: { status: "unknown", latency: 0 },
        },
    };

    let overallHealthy = true;

    // Check database
    const dbStart = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        checks.checks.database = {
            status: "healthy",
            latency: Date.now() - dbStart,
        };
    } catch (error) {
        checks.checks.database = {
            status: "unhealthy",
            latency: Date.now() - dbStart,
        };
        overallHealthy = false;
    }

    // Check embedding service
    const embedStart = Date.now();
    try {
        const embedUrl = process.env.EMBEDDING_SERVICE_URL || "http://localhost:3001";
        const response = await fetch(`${embedUrl}/health`, {
            signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
            checks.checks.embedding_service = {
                status: "healthy",
                latency: Date.now() - embedStart,
            };
        } else {
            throw new Error("Embedding service returned non-OK status");
        }
    } catch (error) {
        checks.checks.embedding_service = {
            status: "unhealthy",
            latency: Date.now() - embedStart,
        };
        // Embedding service is optional for core functionality
        // Don't mark overall as unhealthy, but log warning
        console.warn("Embedding service health check failed:", error);
    }

    // Check AI service (lightweight test)
    const aiStart = Date.now();
    try {
        const aiUrl = (process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:3010") + "/v1/models";
        const response = await fetch(aiUrl, {
            headers: {
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_AI_TOKEN || ""}`,
            },
            signal: AbortSignal.timeout(5000),
        });
        if (response.ok || response.status === 404) {
            // 404 is OK - endpoint might not exist but service is up
            checks.checks.ai_service = {
                status: "healthy",
                latency: Date.now() - aiStart,
            };
        } else {
            throw new Error("AI service returned error");
        }
    } catch (error) {
        checks.checks.ai_service = {
            status: "unhealthy",
            latency: Date.now() - aiStart,
        };
        // AI service is critical
        overallHealthy = false;
    }

    checks.status = overallHealthy ? "healthy" : "unhealthy";

    return NextResponse.json(checks, {
        status: overallHealthy ? 200 : 503,
    });
}
