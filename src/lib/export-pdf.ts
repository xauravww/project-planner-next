"use client";

import jsPDF from "jspdf";

interface ProjectData {
    name: string;
    description?: string;
    requirements?: any[];
    architecture?: any;
    workflows?: any[];
    userStories?: any[];
    techStack?: any;
    mockups?: any[];
}

export function exportProjectToPDF(project: ProjectData) {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Helper to strip markdown formatting
    const stripMarkdown = (text: string): string => {
        if (!text) return '';
        return text
            .replace(/^#{1,6}\s+/gm, '') // Remove headers
            .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.+?)\*/g, '$1') // Remove italic
            .replace(/`(.+?)`/g, '$1') // Remove inline code
            .replace(/^\s*[-*+]\s+/gm, '• ') // Convert list markers to bullets
            .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists to bullets
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
            .trim();
    };

    // Helper to check if we need a new page
    const checkPageBreak = (requiredSpace = 20) => {
        if (yPosition + requiredSpace > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
            return true;
        }
        return false;
    };

    // Helper to add text with proper wrapping
    const addText = (text: string, fontSize = 11, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
        if (!text || text.trim().length === 0) return;

        const cleanText = stripMarkdown(text);
        if (!cleanText || cleanText.trim().length === 0) return;

        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        pdf.setTextColor(color[0], color[1], color[2]);

        const lines = pdf.splitTextToSize(cleanText, maxWidth);

        lines.forEach((line: string) => {
            if (line.trim().length === 0) return;
            checkPageBreak(8);
            pdf.text(line.trim(), margin, yPosition);
            yPosition += 6;
        });

        pdf.setTextColor(0, 0, 0);
    };

    const addSection = (title: string, addSpace = true) => {
        if (addSpace) yPosition += 8;
        checkPageBreak(15);

        // Add colored background bar
        pdf.setFillColor(59, 130, 246); // Blue
        pdf.rect(margin - 5, yPosition - 6, maxWidth + 10, 10, 'F');

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 255, 255);
        pdf.text(title, margin, yPosition);
        pdf.setTextColor(0, 0, 0);

        yPosition += 12;
    };

    const addSubheading = (text: string) => {
        yPosition += 4;
        checkPageBreak(10);
        addText(text, 12, true, [37, 99, 235]);
        yPosition += 2;
    };

    // ===== TITLE PAGE =====
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(project.name, pageWidth / 2, 80, { align: "center" });

    if (project.description && project.description.length < 200) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(148, 163, 184);
        const descLines = pdf.splitTextToSize(project.description, maxWidth - 40);
        let descY = 100;
        descLines.forEach((line: string) => {
            pdf.text(line, pageWidth / 2, descY, { align: "center" });
            descY += 8;
        });
    }

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 30, { align: "center" });
    pdf.setTextColor(0, 0, 0);

    // ===== TABLE OF CONTENTS =====
    pdf.addPage();
    yPosition = 20;
    addSection("Table of Contents", false);

    const sections = [
        { name: "Requirements", count: project.requirements?.length || 0 },
        { name: "Architecture", count: project.architecture ? 1 : 0 },
        { name: "User Stories", count: project.userStories?.length || 0 },
        { name: "Workflows", count: project.workflows?.length || 0 },
        { name: "Tech Stack", count: project.techStack ? 1 : 0 },
        { name: "Mockups", count: project.mockups?.length || 0 },
    ];

    sections.forEach(section => {
        if (section.count > 0) {
            addText(`• ${section.name} (${section.count} item${section.count !== 1 ? 's' : ''})`, 11);
        }
    });

    // ===== REQUIREMENTS =====
    if (project.requirements && project.requirements.length > 0) {
        pdf.addPage();
        yPosition = 20;
        addSection("Requirements", false);

        project.requirements.forEach((req: any, index: number) => {
            yPosition += 5;
            checkPageBreak(25);

            addSubheading(`${index + 1}. ${req.title}`);

            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Type: ${req.type}  |  Priority: ${req.priority}`, margin, yPosition);
            yPosition += 8;
            pdf.setTextColor(0, 0, 0);

            addText(req.content, 10);
        });
    }

    // ===== ARCHITECTURE =====
    if (project.architecture) {
        pdf.addPage();
        yPosition = 20;
        addSection("Architecture", false);

        if (project.architecture.content) {
            addSubheading("Overview");
            addText(project.architecture.content, 10);
            yPosition += 4;
        }

        if (project.architecture.highLevel) {
            checkPageBreak(30);
            addSubheading("High-Level Architecture");
            addText(project.architecture.highLevel, 10);
            yPosition += 4;
        }

        if (project.architecture.lowLevel) {
            checkPageBreak(30);
            addSubheading("Low-Level Details");
            addText(project.architecture.lowLevel, 10);
        }
    }

    // ===== USER STORIES =====
    if (project.userStories && project.userStories.length > 0) {
        pdf.addPage();
        yPosition = 20;
        addSection("User Stories", false);

        project.userStories.forEach((story: any, index: number) => {
            yPosition += 5;
            checkPageBreak(25);

            addSubheading(`${index + 1}. ${story.title}`);

            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            const meta = `Priority: ${story.priority}${story.storyPoints ? ` | Story Points: ${story.storyPoints}` : ''}`;
            pdf.text(meta, margin, yPosition);
            yPosition += 8;
            pdf.setTextColor(0, 0, 0);

            addText(story.content, 10);

            if (story.acceptanceCriteria) {
                yPosition += 3;
                addText("Acceptance Criteria:", 10, true);
                addText(story.acceptanceCriteria, 9);
            }
        });
    }

    // ===== WORKFLOWS =====
    if (project.workflows && project.workflows.length > 0) {
        pdf.addPage();
        yPosition = 20;
        addSection("Workflows", false);

        project.workflows.forEach((workflow: any, index: number) => {
            yPosition += 5;
            checkPageBreak(20);
            addSubheading(`${index + 1}. ${workflow.title}`);
            addText(workflow.content, 10);
        });
    }

    // ===== TECH STACK =====
    if (project.techStack) {
        const categories = [
            { name: "Frontend", data: project.techStack.frontend },
            { name: "Backend", data: project.techStack.backend },
            { name: "Database", data: project.techStack.database },
            { name: "DevOps", data: project.techStack.devops },
            { name: "Other", data: project.techStack.other },
        ];

        // Check if any category has data
        const hasData = categories.some(cat => {
            if (!cat.data) return false;
            try {
                const parsed = typeof cat.data === 'string' ? JSON.parse(cat.data) : cat.data;
                return Array.isArray(parsed) && parsed.length > 0;
            } catch {
                return false;
            }
        });

        if (hasData) {
            pdf.addPage();
            yPosition = 20;
            addSection("Technology Stack", false);

            categories.forEach(category => {
                if (!category.data) return;

                try {
                    let items = typeof category.data === 'string'
                        ? JSON.parse(category.data)
                        : category.data;

                    // Handle case where items might be an array of objects
                    if (Array.isArray(items)) {
                        // If items are objects with a 'name' property, extract that
                        if (items.length > 0 && typeof items[0] === 'object' && items[0].name) {
                            items = items.map((item: any) => item.name);
                        }

                        // Filter out any non-string items
                        items = items.filter((item: any) => typeof item === 'string' && item.trim().length > 0);

                        if (items.length > 0) {
                            checkPageBreak(15);
                            addSubheading(category.name);

                            items.forEach((item: string) => {
                                pdf.setFontSize(10);
                                pdf.text(`• ${item.trim()}`, margin + 5, yPosition);
                                yPosition += 6;
                            });

                            yPosition += 3;
                        }
                    }
                } catch (e) {
                    console.error(`Failed to parse ${category.name}:`, e);
                }
            });
        }
    }

    // ===== MOCKUPS =====
    if (project.mockups && project.mockups.length > 0) {
        pdf.addPage();
        yPosition = 20;
        addSection("Mockups", false);

        project.mockups.forEach((mockup: any, index: number) => {
            yPosition += 5;
            checkPageBreak(20);
            addSubheading(`${index + 1}. Mockup`);

            addText(`Description: ${mockup.prompt}`, 10);

            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Status: ${mockup.status}`, margin, yPosition);
            yPosition += 5;
            pdf.text(`Image URL: ${mockup.imageUrl.substring(0, 80)}...`, margin, yPosition);
            yPosition += 8;
            pdf.setTextColor(0, 0, 0);
        });
    }

    // Save PDF
    const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
}
