import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Readiness probe - used by Kubernetes/load balancers
 * Returns 200 only when app is ready to receive traffic
 */
export async function GET() {
    try {
        // Quick DB check
        await prisma.$queryRaw`SELECT 1`;
        
        return NextResponse.json({ 
            ready: true,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { 
                ready: false,
                error: "Database connection failed",
                timestamp: new Date().toISOString(),
            },
            { status: 503 }
        );
    }
}
