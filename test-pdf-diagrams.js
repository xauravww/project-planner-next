const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Copy the generateProjectHTML function from the export-pdf route
function generateProjectHTML(project) {
    const { requirements, architecture, userStories, workflows, techStack, mockups } = project;

    // Parse tech stack data
    const parseTechStack = (data) => {
        if (!data) return [];
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item) => typeof item === 'object' ? item.name : item)
                    .filter((item) => item && item.trim());
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
    const processContent = (content) => {
        if (!content) return '';

        // 1. Protect Code Blocks (Mermaid and standard)
        const codeBlocks = [];
        let processed = content.replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
            codeBlocks.push(`<div class="mermaid">${code}</div>`);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        processed = processed.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${code}</code></pre>`);
            return `__CODEBLOCK_${codeBlocks.length - 1}__`;
        });

        // 2. Process Markdown (simplified for testing)
        processed = processed.replace(/\n/g, '<br>');

        // Restore Code Blocks
        processed = processed.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => codeBlocks[parseInt(index)]);

        return processed;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${project.name} - Test Export</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .mermaid { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
        .section { margin: 40px 0; }
        .subsection-title { font-weight: bold; margin: 20px 0 10px 0; }
    </style>
</head>
<body>
    <h1>${project.name}</h1>

    <!-- Architecture Section -->
    ${architecture ? `
    <div class="section">
        <h2>Architecture</h2>
        ${architecture.content ? `
            <div class="subsection">
                <div class="subsection-title">Overview</div>
                <div>${processContent(architecture.content)}</div>
            </div>
        ` : ''}
        ${architecture.systemDiagram ? `
            <div class="subsection">
                <div class="subsection-title">System Architecture Diagram</div>
                <div class="mermaid">${architecture.systemDiagram}</div>
            </div>
        ` : ''}
        ${architecture.erDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Database ER Diagram</div>
                <div class="mermaid">${architecture.erDiagram}</div>
            </div>
        ` : ''}
        ${architecture.deploymentDiagram ? `
            <div class="subsection">
                <div class="subsection-title">Deployment Diagram</div>
                <div class="mermaid">${architecture.deploymentDiagram}</div>
            </div>
        ` : ''}
        ${architecture.sequenceDiagrams ? (() => {
            try {
                const diagrams = JSON.parse(architecture.sequenceDiagrams);
                return diagrams.map((item, index) => `
                    <div class="subsection">
                        <div class="subsection-title">Sequence Diagram ${index + 1}: ${item.name || 'Untitled'}</div>
                        <div class="mermaid">${item.diagram || item}</div>
                    </div>
                `).join('');
            } catch (e) {
                return '';
            }
        })() : ''}
    </div>
    ` : ''}

    <!-- Workflows Section -->
    ${workflows?.length > 0 ? `
    <div class="section">
        <h2>Workflows</h2>
        ${workflows.map((workflow, index) => `
            <div>
                <h3>${index + 1}. ${workflow.title}</h3>
                <div>${processContent(workflow.content)}</div>
                ${workflow.diagram ? `<div class="mermaid">${workflow.diagram}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
        }
    </script>
</body>
</html>
    `.trim();
}

async function testPDFDiagrams() {
    console.log('🧪 Testing PDF Diagram Inclusion\n');

    try {
        // Get the project with diagrams
        const project = await prisma.project.findFirst({
            where: { name: 'Blog platform' },
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
            console.error('❌ Project not found');
            return;
        }

        console.log('📋 Project:', project.name);
        console.log('🏗️  Architecture:', !!project.architecture);
        console.log('🔄 Workflows:', project.workflows.length);

        // Generate HTML
        const html = generateProjectHTML(project);
        console.log('📄 Generated HTML length:', html.length);

        // Count mermaid diagrams in HTML
        const mermaidCount = (html.match(/<div class="mermaid">/g) || []).length;
        console.log('📊 Mermaid diagrams found in HTML:', mermaidCount);

        // Save HTML for inspection
        const htmlPath = path.join(__dirname, 'test-diagrams.html');
        fs.writeFileSync(htmlPath, html);
        console.log('💾 HTML saved to:', htmlPath);

        // Extract and display diagram content
        const mermaidMatches = html.match(/<div class="mermaid">([\s\S]*?)<\/div>/g);
        if (mermaidMatches) {
            console.log('\n📈 Diagram Contents:');
            mermaidMatches.forEach((match, index) => {
                const content = match.replace(/<div class="mermaid">|<\/div>/g, '').trim();
                const firstLine = content.split('\n')[0];
                console.log(`  ${index + 1}. ${firstLine.substring(0, 50)}...`);
            });
        }

        console.log('\n✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPDFDiagrams();