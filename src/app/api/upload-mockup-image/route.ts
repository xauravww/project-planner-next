import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const mockupId = formData.get("mockupId") as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!mockupId) {
            return NextResponse.json({ error: "Mockup ID is required" }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "File must be an image" }, { status: 400 });
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const ext = path.extname(file.name);
        const filename = `mockup-${mockupId}-${uuidv4()}${ext}`;

        // Save to public/uploads directory
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "mockups");
        const filePath = path.join(uploadsDir, filename);

        // Ensure directory exists
        const fs = require("fs");
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Write file
        await writeFile(filePath, buffer);

        // Return public URL
        const imageUrl = `/uploads/mockups/${filename}`;

        return NextResponse.json({
            success: true,
            imageUrl
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Upload failed"
        }, { status: 500 });
    }
}
