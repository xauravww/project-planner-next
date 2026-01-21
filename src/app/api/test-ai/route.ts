import { NextResponse } from "next/server";
import { testAPIConnection } from "@/lib/ai-client";

export async function GET() {
    console.log('NEXT_PUBLIC_AI_API_URL:', process.env.NEXT_PUBLIC_AI_API_URL);
    console.log('All env keys starting with NEXT_PUBLIC_AI:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_AI')));
    const result = await testAPIConnection();

    return NextResponse.json(result);
}
