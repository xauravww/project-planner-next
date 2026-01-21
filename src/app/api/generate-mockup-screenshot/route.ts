import { NextResponse } from "next/server";
import { updateMockup } from "@/actions/crud";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { imageData, mockupId } = await req.json();

        if (!imageData || !mockupId) {
            return NextResponse.json(
                { error: "imageData and mockupId are required" },
                { status: 400 }
            );
        }

        // imageData is a base64 encoded PNG from the client
        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Save screenshot to public folder
        const publicDir = path.join(process.cwd(), "public", "mockups");
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        const filename = `${uuidv4()}.png`;
        const filepath = path.join(publicDir, filename);
        fs.writeFileSync(filepath, buffer);

        const imageUrl = `/mockups/${filename}`;

        // Update the mockup with the screenshot
        await updateMockup(mockupId, { imageUrl });

        return NextResponse.json({
            success: true,
            imageUrl
        });
    } catch (error: any) {
        console.error("Error saving screenshot:", error);
        return NextResponse.json(
            { error: error.message || "Failed to save screenshot" },
            { status: 500 }
        );
    }
}
