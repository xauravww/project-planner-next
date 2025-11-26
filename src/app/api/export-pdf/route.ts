import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
// @ts-ignore
import { connect } from "puppeteer-real-browser";

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await req.json();

        // Fetch project data
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: (session.user as any).id,
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
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Generate HTML content
        const html = generateProjectHTML(project);

        // Launch Puppeteer using real-browser
        const { browser, page } = await connect({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            customConfig: {},
            turnstile: true,
            connectOption: {},
            disableXvfb: false,
            ignoreAllFlags: false
        });

        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF with A4 size
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

        await browser.close();

        // Return PDF
        return new NextResponse(Buffer.from(pdf), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
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

    // Helper to process content and wrap mermaid blocks
    const processContent = (content: string) => {
        if (!content) return '';

        // 1. Protect Code Blocks (Mermaid and standard)
        const codeBlocks: string[] = [];
        let processed = content.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            codeBlocks.push(`<div class="mermaid">${code}</div>`);
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            -webkit-print-color-adjust: exact;
        }

        /* Markdown Styles */
        h1, h2, h3 { color: #2d3748; margin-top: 20px; margin-bottom: 10px; }
        h1 { font-size: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        
        ul, ol { margin-left: 20px; margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        
        blockquote {
            border-left: 4px solid #cbd5e0;
            padding-left: 15px;
            color: #4a5568;
            font-style: italic;
            margin: 15px 0;
        }
        
        strong { color: #2d3748; font-weight: 700; }
        
        a { color: #3182ce; text-decoration: none; }
        
        img { max-width: 100%; height: auto; }
        
        hr { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }

        .cover-page {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            page-break-after: always;
            text-align: center;
            padding: 40px;
        }

        .cover-title {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .cover-description {
            font-size: 18px;
            max-width: 600px;
            margin-bottom: 40px;
            opacity: 0.9;
        }

        .cover-meta {
            font-size: 14px;
            opacity: 0.8;
        }

        .toc {
            page-break-after: always;
            padding: 40px 0;
        }

        .toc h1 {
            font-size: 32px;
            color: #667eea;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }

        .toc-item {
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .toc-item span {
            font-size: 16px;
        }

        .toc-count {
            color: #666;
            font-size: 14px;
        }

        .section {
            page-break-before: always;
            padding: 20px 0;
        }

        .section-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 30px;
            margin: -20px 0 30px 0;
            border-radius: 8px;
        }

        .section-title {
            font-size: 28px;
            font-weight: bold;
        }

        .subsection {
            margin-bottom: 30px;
        }

        .subsection-title {
            font-size: 20px;
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e0e0e0;
        }

        .item {
            margin-bottom: 25px;
            padding: 20px;
            background: #f9fafb;
            border-left: 4px solid #667eea;
            border-radius: 4px;
        }

        .item-title {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 8px;
        }

        .item-meta {
            font-size: 13px;
            color: #666;
            margin-bottom: 12px;
            font-style: italic;
        }

        .item-content {
            font-size: 14px;
            line-height: 1.7;
            color: #333;
        }

        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .tech-category {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }

        .tech-category-title {
            font-size: 16px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }

        .tech-item {
            padding: 6px 0;
            font-size: 14px;
            color: #333;
        }

        .tech-item::before {
            content: "• ";
            color: #667eea;
            font-weight: bold;
        }

        .mockup-item {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .mockup-image {
            width: 100%;
            max-height: 500px;
            object-fit: contain;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            margin-top: 15px;
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
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            margin: 20px 0;
            text-align: center;
        }

        @media print {
            .section {
                page-break-before: always;
            }
            .item {
                page-break-inside: avoid;
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
            <div class="section-title">Requirements</div>
        </div>
        ${requirements.map((req: any, index: number) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${req.title}</div>
                <div class="item-meta">Type: ${req.type} | Priority: ${req.priority}</div>
                <div class="item-content">${processContent(req.content)}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Architecture Section -->
    ${architecture ? `
    <div class="section">
        <div class="section-header">
            <div class="section-title">Architecture</div>
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
    </div>
    ` : ''}

    <!-- User Stories Section -->
    ${userStories?.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <div class="section-title">User Stories</div>
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
            <div class="section-title">Workflows</div>
        </div>
        ${workflows.map((workflow: any, index: number) => `
            <div class="item">
                <div class="item-title">${index + 1}. ${workflow.title}</div>
                <div class="item-content">${processContent(workflow.content)}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- Tech Stack Section -->
    ${techCategories.length > 0 ? `
    <div class="section">
        <div class="section-header">
            <div class="section-title">Technology Stack</div>
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
            <div class="section-title">Mockups</div>
        </div>
        ${mockups.map((mockup: any, index: number) => `
            <div class="mockup-item">
                <div class="item-title">${index + 1}. ${mockup.prompt}</div>
                <div class="item-meta">Status: ${mockup.status}</div>
                ${mockup.imageUrl ? `<img src="${mockup.imageUrl}" alt="Mockup ${index + 1}" class="mockup-image" />` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-jsx.min.js"></script>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
</body>
</html>
    `.trim();
}
