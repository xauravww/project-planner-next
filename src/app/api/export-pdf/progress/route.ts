import { NextRequest, NextResponse } from "next/server";
import { getProgress, getPDF } from "@/lib/pdf-progress";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const exportId = searchParams.get('exportId');

        if (!exportId) {
            return NextResponse.json({ error: "exportId is required" }, { status: 400 });
        }

        const progress = getProgress(exportId);

        // Check if PDF is ready for download
        const pdfData = getPDF(exportId);
        if (pdfData && progress.status === 'completed') {
            // Clean up old progress data after some time
            setTimeout(() => {
                // Note: cleanup is handled by the pdf-progress module
            }, 300000); // 5 minutes

            return NextResponse.json({
                ...progress,
                downloadReady: true,
                pdfSize: pdfData.pdf.length
            });
        }

        return NextResponse.json({
            ...progress,
            downloadReady: false
        });

    } catch (error) {
        console.error('Progress check error:', error);
        return NextResponse.json(
            { error: "Failed to check progress" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { exportId } = await req.json();

        if (!exportId) {
            return NextResponse.json({ error: "exportId is required" }, { status: 400 });
        }

        const pdfData = getPDF(exportId);

        if (!pdfData) {
            return NextResponse.json({ error: "PDF not found or not ready" }, { status: 404 });
        }

        // Return the PDF
        return new NextResponse(Buffer.from(pdfData.pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="project_export_${exportId}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF download error:', error);
        return NextResponse.json(
            { error: "Failed to download PDF" },
            { status: 500 }
        );
    }
}