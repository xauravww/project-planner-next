import { NextResponse } from "next/server";
import { testAPIConnection } from "@/lib/ai-client";

export async function GET() {
    const result = await testAPIConnection();

    return NextResponse.json(result);
}
