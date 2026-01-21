import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer-core";
import { updateProgress, clearProgress, storePDF } from "@/lib/pdf-progress";

export async function POST(req: NextRequest) {
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await req.json();

        // Initialize progress before starting background processing
        updateProgress(exportId, 0, 'starting', 'Initializing PDF export...');

        // Start background processing
        processPDFExport(exportId, projectId, session.user);

        // Return immediately with export ID
        return NextResponse.json({
            exportId,
            message: "PDF export started",
            status: "processing"
        });

    } catch (error) {
        clearProgress(exportId);
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}

// Background PDF processing function
async function processPDFExport(exportId: string, projectId: string, user: any) {
    let browser;
    try {
        updateProgress(exportId, 5, 'starting', 'Initializing PDF export...');

        // Fetch project data
        updateProgress(exportId, 10, 'fetching', 'Gathering project data...');
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: user.id,
            },
            include: {
                requirements: true,
                architecture: true,
                workflows: true,
                userStories: true,
                techStack: true,
                mockups: true,
            },
        });

        if (!project) {
            updateProgress(exportId, 0, 'error', 'Project not found');
            return;
        }

        updateProgress(exportId, 20, 'generating', 'Building beautiful layout...');

        // Generate HTML content
        const html = generateProjectHTML(project);

        updateProgress(exportId, 30, 'rendering', 'Setting up browser...');

        // Launch Puppeteer
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
            process.env.CHROME_BIN ||
            '/usr/bin/google-chrome-stable' ||
            '/usr/bin/chromium-browser' ||
            '/usr/bin/chromium';

        browser = await puppeteer.launch({
            executablePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ],
        });

        updateProgress(exportId, 35, 'rendering', 'Browser initialized...');

        const page = await browser.newPage();

        updateProgress(exportId, 40, 'rendering', 'Loading page content...');

        // Set up request interception
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['media', 'font'].includes(resourceType)) {
                request.abort();
            } else {
                request.continue();
            }
        });

        page.on('requestfailed', (request) => {
            console.log('Request failed (non-critical):', request.url());
        });

        page.setDefaultTimeout(90000);

        updateProgress(exportId, 50, 'rendering', 'Rendering diagrams...');

        await page.setContent(html, {
            waitUntil: 'load',
            timeout: 90000
        });

        // Check for Mermaid diagrams
        const mermaidDiagramCount = await page.evaluate(() => {
            return document.querySelectorAll('.mermaid').length;
        });

        if (mermaidDiagramCount > 0) {
            updateProgress(exportId, 60, 'rendering', 'Processing diagrams...');

            await page.waitForFunction(() => {
                return typeof (window as any).mermaid !== 'undefined';
            }, { timeout: 20000 }).catch(() => false);

            const mermaidLoaded = await page.evaluate(() => {
                return typeof (window as any).mermaid !== 'undefined';
            });

            if (mermaidLoaded) {
                await page.evaluate(() => {
                    if (typeof (window as any).mermaid !== 'undefined') {
                        const diagrams = document.querySelectorAll('.mermaid');
                        (window as any).mermaid.init(undefined, diagrams);
                    }
                });
                await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
            }
        }

        updateProgress(exportId, 70, 'rendering', 'Processing mockups...');

        // Wait for iframes
        const hasIframes = await page.$$('iframe.mockup-iframe');
        if (hasIframes.length > 0) {
            await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));
        }

        updateProgress(exportId, 85, 'generating', 'Creating PDF document...');

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm',
            },
        });

        updateProgress(exportId, 95, 'finalizing', 'Preparing download...');

        await browser.close();

        updateProgress(exportId, 100, 'completed', 'PDF ready for download!');

        // Store the PDF data temporarily (in production, use cloud storage)
        storePDF(exportId, Buffer.from(pdf));

    } catch (error) {
        updateProgress(exportId, 0, 'error', 'Failed to generate PDF');
        console.error('PDF generation error:', error);
    } finally {
        if (browser) {
            await browser.close().catch(() => { });
        }
    }
}

function generateProjectHTML(project: any): string {
    const { requirements, architecture, userStories, workflows, techStack, mockups } = project;

    // Parse tech stack data
    const parseTechStack = (data: any) => {
        if (!data) return [];
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item: any) => typeof item === 'object' ? item.name : item)
                    .filter((item: string) => item && item.trim());
            }
        } catch (e) {
            console.error('Failed to parse tech stack:', e);
        }
        return [];
    };

    const techCategories = [
        { name: 'Frontend', items: parseTechStack(techStack?.frontend) },
        { name: 'Backend', items: parseTechStack(techStack?.backend) },
        { name: 'Database', items: parseTechStack(techStack?.database) },
        { name: 'DevOps', items: parseTechStack(techStack?.devops) },
        { name: 'Other', items: parseTechStack(techStack?.other) },
    ].filter(cat => cat.items.length > 0);

    // Helper to validate Mermaid syntax
    const validateMermaidSyntax = (code: string): boolean => {
        if (!code || code.trim().length === 0) return false;

        const trimmed = code.trim();

        // Check for common diagram types
        const validStarts = [
            'graph', 'flowchart', 'sequenceDiagram', 'classDiagram',
            'stateDiagram', 'erDiagram', 'journey', 'gantt',
            'pie', 'gitgraph', 'mindmap', 'timeline', 'sankey'
        ];

        const firstLine = trimmed.split('\n')[0].trim().toLowerCase();
        const hasValidStart = validStarts.some(type => firstLine.startsWith(type.toLowerCase()));

        if (!hasValidStart) return false;

        // Basic syntax checks
        const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Must have at least 2 lines for a valid diagram
        if (lines.length < 2) return false;

        // Check for balanced brackets/quotes (basic check)
        let bracketCount = 0;
        let braceCount = 0;
        let parenCount = 0;

        for (const line of lines) {
            for (const char of line) {
                switch (char) {
                    case '[': bracketCount++; break;
                    case ']': bracketCount--; break;
                    case '{': braceCount++; break;
                    case '}': braceCount--; break;
                    case '(': parenCount++; break;
                    case ')': parenCount--; break;
                }
            }
        }

        return bracketCount === 0 && braceCount === 0 && parenCount === 0;
    };

    // Helper to process content and wrap mermaid blocks
    const processContent = (content: string) => {
        if (!content) return '';

        // 1. Protect Code Blocks (Mermaid and standard)
        const codeBlocks: string[] = [];
        let processed = content.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            // Validate Mermaid syntax before including
            if (validateMermaidSyntax(code)) {
                codeBlocks.push(`<div class="mermaid">${code}</div>`);
            } else {
                // Replace with error message instead of diagram
                codeBlocks.push(`<div class="mermaid-error">⚠️ Diagram syntax error - content skipped</div>`);
            }
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${code}</code></pre>`);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        // 2. Process Markdown

        // Headers
        processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Bold & Italic
        processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processed = processed.replace(/__(.*?)__/g, '<strong>$1</strong>');
        processed = processed.replace(/_(.*?)_/g, '<em>$1</em>');

        // Lists
        // Unordered
        processed = processed.replace(/^\s*[\-\*]\s+(.*)$/gm, '<ul><li>$1</li></ul>');
        processed = processed.replace(/<\/ul>\s*<ul>/g, ''); // Join adjacent lists

        // Ordered
        processed = processed.replace(/^\s*\d+\.\s+(.*)$/gm, '<ol><li>$1</li></ol>');
        processed = processed.replace(/<\/ol>\s*<ol>/g, ''); // Join adjacent lists

        // Blockquotes
        processed = processed.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

        // Inline Code
        processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Images
        processed = processed.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">');

        // Horizontal Rules
        processed = processed.replace(/^---$/gm, '<hr>');

        // Paragraphs (double newline to p)
        processed = processed.replace(/\n\n/g, '</p><p>');

        // Restore Code Blocks
        processed = processed.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => codeBlocks[parseInt(index)]);

        // Final cleanup: replace remaining newlines with <br> only if not inside tags
        // This is a bit tricky, so we'll just handle simple cases or rely on block elements
        processed = processed.replace(/\n/g, '<br>');

        // Clean up excessive breaks around block elements
        processed = processed.replace(/<br><\/(h1|h2|h3|ul|ol|pre|div|blockquote)>/g, '</$1>');
        processed = processed.replace(/<(h1|h2|h3|ul|ol|pre|div|blockquote)><br>/g, '<$1>');

        return processed;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Project Export</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f8fafc;
            -webkit-print-color-adjust: exact;
            -webkit-font-smoothing: antialiased;
            margin: 0;
            padding: 0;
        }

        /* Professional Typography */
        h1, h2, h3, h4 {
            color: #1a202c;
            font-weight: 600;
            line-height: 1.3;
            margin-top: 24px;
            margin-bottom: 12px;
        }

        h1 { font-size: 28px; border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 20px; }
        h2 { font-size: 22px; color: #2b6cb0; margin-top: 30px; }
        h3 { font-size: 18px; color: #2c5282; }
        h4 { font-size: 16px; color: #2c5282; font-weight: 500; }

        p {
            margin-bottom: 12px;
            line-height: 1.6;
            color: #2d3748;
        }

        ul, ol {
            margin-left: 24px;
            margin-bottom: 16px;
            padding-left: 8px;
        }

        li {
            margin-bottom: 6px;
            line-height: 1.5;
        }

        blockquote {
            border-left: 4px solid #3182ce;
            padding: 12px 20px;
            margin: 20px 0;
            background: #f7fafc;
            border-radius: 0 4px 4px 0;
            font-style: italic;
            color: #4a5568;
        }

        strong { color: #1a202c; font-weight: 600; }
        em { color: #4a5568; }

        a {
            color: #3182ce;
            text-decoration: underline;
            text-decoration-thickness: 1px;
        }

        code {
            background: #f1f5f9;
            color: #e53e3e;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            font-size: 14px;
            border: 1px solid #e2e8f0;
        }

        hr {
            border: 0;
            height: 1px;
            background: linear-gradient(to right, #e2e8f0, #cbd5e0, #e2e8f0);
            margin: 24px 0;
        }

        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #ffffff;
            color: #1a202c;
            page-break-after: always;
            text-align: center;
            padding: 60px;
            border: 2px solid #e2e8f0;
            position: relative;
        }

        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(43, 108, 176, 0.05) 0%, rgba(44, 82, 130, 0.05) 100%);
            pointer-events: none;
        }

        .cover-title {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 24px;
            color: #2b6cb0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            position: relative;
            z-index: 1;
        }

        .cover-description {
            font-size: 16px;
            max-width: 700px;
            margin-bottom: 40px;
            color: #4a5568;
            line-height: 1.6;
            position: relative;
            z-index: 1;
        }

        .cover-meta {
            font-size: 12px;
            color: #718096;
            position: relative;
            z-index: 1;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }

        .toc {
            page-break-after: always;
            padding: 50px 0;
            background: #f8fafc;
        }

        .toc h1 {
            font-size: 28px;
            color: #2b6cb0;
            margin-bottom: 40px;
            padding-bottom: 12px;
            border-bottom: 3px solid #2b6cb0;
            text-align: center;
        }

        .toc-item {
            padding: 16px 20px;
            margin: 8px 0;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #3182ce;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .toc-item span {
            font-size: 16px;
            font-weight: 500;
            color: #2d3748;
        }

        .toc-count {
            color: #718096;
            font-size: 14px;
            background: #edf2f7;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 500;
        }

        .section {
            page-break-before: always;
            padding: 40px 0;
            min-height: 100vh;
        }

        .section-header {
            background: linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%);
            color: white;
            padding: 24px 40px;
            margin: -40px 0 40px 0;
            border-radius: 0 0 12px 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .section-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .subsection {
            margin-bottom: 32px;
            background: white;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #e2e8f0;
        }

        .subsection-title {
            font-size: 20px;
            color: #2b6cb0;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #bee3f8;
            font-weight: 600;
        }

        .item {
            margin-bottom: 24px;
            padding: 24px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #3182ce;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: box-shadow 0.2s ease;
        }

        .item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .item-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .item-meta {
            font-size: 13px;
            color: #718096;
            margin-bottom: 16px;
            font-weight: 500;
            background: #f7fafc;
            padding: 6px 12px;
            border-radius: 20px;
            display: inline-block;
        }

        .item-content {
            font-size: 15px;
            line-height: 1.7;
            color: #2d3748;
        }

        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
            margin-top: 24px;
        }

        .tech-category {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tech-category:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .tech-category-title {
            font-size: 18px;
            font-weight: 600;
            color: #2b6cb0;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #bee3f8;
            text-align: center;
        }

        .tech-item {
            padding: 8px 12px;
            margin: 4px 0;
            font-size: 14px;
            color: #4a5568;
            background: #f7fafc;
            border-radius: 6px;
            border-left: 3px solid #3182ce;
            font-weight: 500;
        }

        .tech-item::before {
            content: "▸ ";
            color: #3182ce;
            font-weight: bold;
            margin-right: 4px;
        }

        .mockup-item {
            margin-bottom: 32px;
            page-break-inside: avoid;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .mockup-iframe {
            width: 100% !important;
            min-height: 400px !important;
            border: 2px solid #e2e8f0 !important;
            border-radius: 8px !important;
            background: white !important;
            margin-top: 16px !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
            page-break-inside: avoid !important;
            overflow: visible !important;
        }

        /* Allow iframes to break across pages if they're very long */
        .mockup-iframe[style*="height"] {
            page-break-inside: auto !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
        }

        /* Special handling for very tall iframes */
        .mockup-iframe.tall-content {
            page-break-inside: auto !important;
            page-break-before: auto !important;
            page-break-after: auto !important;
        }

        .mockup-image {
            width: 100%;
            max-height: 70vh;
            object-fit: contain;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            margin-top: 16px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
        }

        pre {
            background: #2d2d2d;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 15px 0;
        }

        pre code {
            background: none;
            color: #f8f8f2;
            padding: 0;
        }

        .mermaid {
            background: #f8fafc;
            padding: 24px;
            border-radius: 10px;
            border: 2px solid #cbd5e0;
            margin: 24px 0;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            position: relative;
            max-height: 70vh;
            overflow: hidden;
            page-break-inside: avoid;
        }

        .mermaid svg {
            max-width: 100%;
            max-height: 60vh;
            height: auto;
            border-radius: 6px;
            object-fit: contain;
        }

        .mermaid-error {
            background: #fed7d7;
            color: #c53030;
            padding: 16px;
            border-radius: 8px;
            border: 2px solid #feb2b2;
            margin: 16px 0;
            font-weight: 500;
            text-align: center;
            font-size: 14px;
        }

        /* Content scaling utilities */
        .scale-to-fit {
            max-width: 100%;
            max-height: 70vh;
            object-fit: contain;
        }

        .scaled-content {
            transform-origin: top center;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        /* Ensure scaled iframes maintain aspect ratio */
        .mockup-iframe.scaled-content {
            width: calc(100% / 0.7) !important; /* Compensate for 0.7 scale */
            transform-origin: top left;
        }

        @media print {
            body {
                background: white !important;
                -webkit-print-color-adjust: exact;
            }

            .section {
                page-break-before: always;
                background: white;
            }

            .toc {
                background: white !important;
            }

            .item, .subsection, .tech-category {
                page-break-inside: avoid;
                box-shadow: none !important;
                border: 1px solid #ccc !important;
            }

            .mermaid {
                page-break-inside: avoid;
                box-shadow: none !important;
                max-height: 70vh !important;
                overflow: hidden !important;
            }

            .mockup-item {
                page-break-inside: avoid;
            }

            .mockup-iframe {
                /* Allow full height for complete rendering */
                min-height: 600px !important;
                max-height: none !important;
                transform: none !important;
                page-break-inside: auto !important; /* Allow breaking for very long content */
                overflow: visible !important;
                display: block !important;
            }

            .mockup-iframe.tall-content {
                page-break-inside: auto !important;
                page-break-before: auto !important;
                page-break-after: auto !important;
            }

            .mockup-image {
                max-height: 70vh !important;
            }

            h1, h2, h3, h4 {
                page-break-after: avoid;
            }

            .item-title {
                page-break-after: avoid;
            }

            /* Force page breaks for large content */
            .mermaid, .mockup-item {
                page-break-inside: avoid !important;
            }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="cover-title">${project.name}</div>
        ${project.description ? `<div class="cover-description">${project.description}</div>` : ''}
        <div class="cover-meta">
            Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}
        </div>
    </div>

    <!-- Table of Contents -->
    <div class="toc">
        <h1>Table of Contents</h1>
        ${requirements?.length > 0 ? `<div class="toc-item"><span>Requirements</span><span class="toc-count">${requirements.length} items</span></div>` : ''}
        ${architecture ? `<div class="toc-item"><span>Architecture</span><span class="toc-count">1 item</span></div>` : ''}
        ${userStories?.length > 0 ? `<div class="toc-item"><span>User Stories</span><span class="toc-count">${userStories.length} items</span></div>` : ''}
        ${workflows?.length > 0 ? `<div class="toc-item"><span>Workflows</span><span class="toc-count">${workflows.length} items</span></div>` : ''}
        ${techCategories.length > 0 ? `<div class="toc-item"><span>Technology Stack</span><span class="toc-count">${techCategories.length} categories</span></div>` : ''}
        ${mockups?.length > 0 ? `<div class="toc-item"><span>Mockups</span><span class="toc-count">${mockups.length} items</span></div>` : ''}
    </div>

     <!-- Requirements Section -->
     ${requirements?.length > 0 ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">📋 Requirements</div>
         </div>
         <div style="display: grid; gap: 20px;">
         ${requirements.map((req: any, index: number) => `
             <div class="item">
                 <div class="item-title">${index + 1}. ${req.title}</div>
                 <div class="item-meta">Type: ${req.type} | Priority: ${req.priority}</div>
                 <div class="item-content">${processContent(req.content)}</div>
             </div>
         `).join('')}
         </div>
     </div>
     ` : ''}

     <!-- Architecture Section -->
     ${architecture ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">🏗️ Architecture</div>
         </div>
        ${architecture.content ? `
            <div class="subsection">
                <div class="subsection-title">Overview</div>
                <div class="item-content">${processContent(architecture.content)}</div>
            </div>
        ` : ''}
        ${architecture.highLevel ? `
            <div class="subsection">
                <div class="subsection-title">High-Level Architecture</div>
                <div class="item-content">${processContent(architecture.highLevel)}</div>
            </div>
        ` : ''}
        ${architecture.lowLevel ? `
            <div class="subsection">
                <div class="subsection-title">Low-Level Details</div>
                <div class="item-content">${processContent(architecture.lowLevel)}</div>
            </div>
        ` : ''}
        ${architecture.systemDiagram ? `
            <div class="subsection">
                <div class="subsection-title">System Architecture Diagram</div>
                <div class="item-content">
                    <div class="mermaid">${architecture.systemDiagram}</div>
                </div>
            </div>
        ` : ''}
        ${architecture.erDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Database ER Diagram</div>
                <div class="item-content">
                    <div class="mermaid">${architecture.erDiagram}</div>
                </div>
            </div>
        ` : ''}
        ${architecture.dataFlowDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Data Flow Diagram</div>
                <div class="item-content">
                    <div class="mermaid">${architecture.dataFlowDiagram}</div>
                </div>
            </div>
        ` : ''}
        ${architecture.deploymentDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Deployment Diagram</div>
                <div class="item-content">
                    <div class="mermaid">${architecture.deploymentDiagram}</div>
                </div>
            </div>
        ` : ''}
        ${architecture.componentDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Component Diagram</div>
                <div class="item-content">
                    <div class="mermaid">${architecture.componentDiagram}</div>
                </div>
            </div>
        ` : ''}
        ${architecture.sequenceDiagrams ? (() => {
            try {
                const diagrams = JSON.parse(architecture.sequenceDiagrams);
                return diagrams.map((item: any, index: number) => `
                    <div class="subsection">
                        <div class="subsection-title">Sequence Diagram ${index + 1}: ${item.name || 'Untitled'}</div>
                        <div class="item-content">
                            <div class="mermaid">${item.diagram || item}</div>
                        </div>
                    </div>
                `).join('');
            } catch (e) {
                return '';
            }
        })() : ''}
    </div>
    ` : ''}

     <!-- User Stories Section -->
     ${userStories?.length > 0 ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">👥 User Stories</div>
         </div>
        ${userStories.map((story: any, index: number) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${story.title}</div>
                <div class="item-meta">Priority: ${story.priority}${story.storyPoints ? ` | Story Points: ${story.storyPoints}` : ''}</div>
                <div class="item-content">${processContent(story.content)}</div>
                ${story.acceptanceCriteria ? `
                    <div style="margin-top: 15px;">
                        <strong>Acceptance Criteria:</strong>
                        <div style="margin-top: 8px;">${processContent(story.acceptanceCriteria)}</div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

     <!-- Workflows Section -->
     ${workflows?.length > 0 ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">🔄 Workflows</div>
         </div>
        ${workflows.map((workflow: any, index: number) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${workflow.title}</div>
                <div class="item-content">${processContent(workflow.content)}</div>
                ${workflow.diagram ? `
                    <div class="item-content">
                        <div class="mermaid">${workflow.diagram}</div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

     <!-- Tech Stack Section -->
     ${techCategories.length > 0 ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">⚡ Technology Stack</div>
         </div>
        <div class="tech-grid">
            ${techCategories.map(category => `
                <div class="tech-category">
                    <div class="tech-category-title">${category.name}</div>
                    ${category.items.map((item: string) => `<div class="tech-item">${item}</div>`).join('')}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

     <!-- Mockups Section -->
     ${mockups?.length > 0 ? `
     <div class="section">
         <div class="section-header">
             <div class="section-title">🎨 Mockups</div>
         </div>
        ${mockups.map((mockup: any, index: number) => {
        const escapedCode = mockup.code ? mockup.code.replace(/`/g, '\\`').replace(/\$/g, '\\$') : '';
        return `
            <div class="mockup-item">
                <div class="item-title">${index + 1}. ${mockup.prompt}</div>
                <div class="item-meta">Status: ${mockup.status}</div>
                  ${mockup.code ? `
                      <div style="margin-bottom: 8px; font-size: 12px; color: #666; font-style: italic;">
                          📱 Interactive mockup preview (may span multiple pages for complete view)
                      </div>
                      <iframe
                          class="mockup-iframe"
                          srcdoc="${escapedCode.replace(/"/g, '&quot;')}"
                          sandbox="allow-scripts"
                          style="height: 800px;"
                      ></iframe>
                  ` : mockup.imageUrl ? `
                      <img src="${mockup.imageUrl}" alt="Mockup ${index + 1}" class="mockup-image" />
                  ` : ''}
            </div>
        `;
    }).join('')}
    </div>
    ` : ''}

     <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-jsx.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
     <script>
         // Initialize Mermaid when ready
         if (typeof mermaid !== 'undefined') {
             mermaid.initialize({
                 startOnLoad: false,
                 theme: 'default',
                 securityLevel: 'loose'
             });
         }

         // Function to adjust iframe heights and scale content to fit within page
         function adjustContentForPDF() {
             const pageHeight = 1000; // Conservative page height in pixels
             const maxScale = 0.2; // Minimum scale factor to prevent unreadability

             // Helper function to scale element
             function scaleElement(element, scaleOrigin) {
                 if (scaleOrigin === undefined) scaleOrigin = 'top center';
                 const rect = element.getBoundingClientRect();
                 if (rect.height > pageHeight * 0.9) { // If element takes more than 90% of page height
                     const scale = Math.max(maxScale, (pageHeight * 0.8) / rect.height);
                     element.style.transform = 'scale(' + scale + ')';
                     element.style.transformOrigin = scaleOrigin;
                     element.style.marginBottom = (rect.height * (1 - scale) + 20) + 'px';
                     element.classList.add('scaled-content');
                 }
             }

             // Adjust iframe heights to show complete content
             const iframes = document.querySelectorAll('.mockup-iframe');
             iframes.forEach(iframe => {
                 try {
                     // Try to set iframe height based on content
                     const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                     if (iframeDoc) {
                         const body = iframeDoc.body;
                         const html = iframeDoc.documentElement;
                         const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
                     if (height > 400) { // Only adjust if content is taller than min-height
                         iframe.style.height = height + 'px';
                         console.log('Adjusted iframe height to:', height, 'px');
                         // Mark as tall content if it's very tall (will span multiple pages)
                         if (height > 1200) {
                             iframe.classList.add('tall-content');
                             console.log('Marked iframe as tall content');
                         }
                     }
                     }
                 } catch (e) {
                     // Cross-origin restriction, set a reasonable height
                     console.log('Could not adjust iframe height due to cross-origin restrictions, setting default height');
                     iframe.style.height = '1000px'; // Generous height for complete rendering
                 }
             });

             // Scale mermaid diagrams
             const mermaidContainers = document.querySelectorAll('.mermaid');
             mermaidContainers.forEach(container => scaleElement(container, 'top center'));

             // Scale images
             const images = document.querySelectorAll('.mockup-image');
             images.forEach(img => scaleElement(img, 'top center'));
         }

         // Run content adjustment after content loads
         window.addEventListener('load', function() {
             // Wait for all content to load, then adjust
             setTimeout(function() {
                 adjustContentForPDF();
                 // Run again after a short delay to handle dynamic content
                 setTimeout(adjustContentForPDF, 1000);
             }, 3000);
         });

         // Also run adjustment when Mermaid diagrams are rendered
         if (typeof mermaid !== 'undefined') {
             const originalInit = mermaid.init;
             mermaid.init = function() {
                 const result = originalInit.apply(this, arguments);
                 setTimeout(adjustContentForPDF, 500);
                 return result;
             };
         }
     </script>
</body>
</html>
    `.trim();
}
