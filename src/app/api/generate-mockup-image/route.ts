import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateImageWithPuppeteer } from "@/lib/puppeteer-image-gen";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minutes timeout

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        console.log(`🎨 Starting image generation for prompt: "${prompt}"`);

        const result = await generateImageWithPuppeteer(prompt);

        if (result.success && result.imageUrl) {
            return NextResponse.json({
                success: true,
                imageUrl: result.imageUrl
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error || "Image generation failed"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Image generation API error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Internal server error"
        }, { status: 500 });
    }
}
