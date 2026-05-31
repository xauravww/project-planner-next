"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { FileText, Palette, BarChart3, Monitor, FileCheck, Download, Sparkles, Zap } from "lucide-react";

interface PDFExportProgressProps {
  isOpen: boolean;
  onCancel: () => void;
  projectStats: {
    requirements: number;
    workflows: number;
    userStories: number;
    mockups: number;
  };
  progressData?: {
    progress: number;
    status: string;
    message: string;
  };
}

const EXPORT_STEPS = [
  {
    icon: FileText,
    title: "Gathering project data",
    message: "🔍 Unearthing your project treasures...",
    duration: 2000,
  },
  {
    icon: Palette,
    title: "Building beautiful layout",
    message: "🎨 Painting your documentation masterpiece...",
    duration: 3000,
  },
  {
    icon: BarChart3,
    title: "Rendering diagrams",
    message: "📊 Giving life to your diagrams and charts...",
    duration: 5000,
  },
  {
    icon: Monitor,
    title: "Processing mockups",
    message: "🎭 Polishing your UI mockups to perfection...",
    duration: 4000,
  },
  {
    icon: FileCheck,
    title: "Creating PDF document",
    message: "📋 Weaving everything into a professional PDF...",
    duration: 8000,
  },
  {
    icon: Download,
    title: "Preparing download",
    message: "✅ Your project export is ready to shine! ✨",
    duration: 1000,
  },
];

const FUN_FACTS = [
  "💡 Professional PDFs can include up to 100+ pages of documentation!",
  "🎯 Your PDF will look great on any device or printer! 📱🖨️",
  "⚡ PDFs maintain perfect formatting across all platforms!",
  "🌟 Your documentation is about to become a masterpiece!",
  "🚀 Ready to share your project vision with the world!",
];

export function PDFExportProgress({ isOpen, onCancel, projectStats, progressData }: PDFExportProgressProps) {
  const [funFactIndex, setFunFactIndex] = useState(0);

  // Use real progress data if provided, otherwise show default
  const currentProgress = progressData?.progress || 0;
  const currentStatus = progressData?.status || 'idle';
  const currentMessage = progressData?.message || 'Preparing...';

  // Find the current step based on progress
  const currentStepIndex = Math.min(
    Math.floor((currentProgress / 100) * EXPORT_STEPS.length),
    EXPORT_STEPS.length - 1
  );

  useEffect(() => {
    if (!isOpen) {
      setFunFactIndex(0);
      return;
    }

    // Rotate fun facts every 3 seconds
    const factInterval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % FUN_FACTS.length);
    }, 3000);

    return () => {
      clearInterval(factInterval);
    };
  }, [isOpen]);

  const currentStepData = EXPORT_STEPS[Math.max(0, currentStepIndex)];
  const IconComponent = currentStepData.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md bg-[var(--color-nebula-surface)] border-[var(--color-nebula-hairline-strong)] rounded-[var(--r-lg)]">
        <DialogHeader className="text-center">
          <DialogTitle className="type-h3 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-[color:var(--color-accent-yellow)]" />
            Exporting Your Project
          </DialogTitle>
          <DialogDescription className="text-[color:var(--color-charcoal)]">
            We&apos;re creating a beautiful PDF of your project documentation
          </DialogDescription>
        </DialogHeader>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between type-small">
              <span className="text-[color:var(--color-charcoal)]">{currentStepData.title}</span>
              <span className="text-[color:var(--color-ash)]">{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          <div className="text-center type-small text-[color:var(--color-ash)]">
            {currentStatus === 'completed' ? "Download ready!" :
             currentStatus === 'error' ? "Export failed" :
             "Processing your project..."}
          </div>
        </div>

        {/* Animated Content */}
        <div className="text-center space-y-6 py-4">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[var(--color-nebula-hairline-strong)] rounded-full animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-[var(--color-nebula-fg)] flex items-center justify-center">
              <IconComponent className={`w-8 h-8 text-[color:var(--color-nebula-bg)] ${currentStatus === 'completed' ? 'animate-bounce' : 'animate-spin'}`} />
            </div>
          </div>

          {/* Entertaining Message */}
          <div className="min-h-[60px] flex items-center justify-center">
            <p
              key={currentStepIndex}
              className="type-body-lg text-[color:var(--color-nebula-fg)] animate-fade-in"
            >
              {currentMessage}
            </p>
          </div>

          {/* Fun Fact */}
          <div className="bg-[var(--color-nebula-bg)] rounded-[var(--r-md)] p-4 border border-[var(--color-nebula-hairline-strong)]">
            <p className="type-small text-[color:var(--color-charcoal)] animate-fade-in" key={funFactIndex}>
              {FUN_FACTS[funFactIndex]}
            </p>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[var(--color-nebula-bg)] rounded-[var(--r-md)] p-3 border border-[var(--color-nebula-hairline-strong)]">
              <div className="type-h3 text-[color:var(--color-nebula-fg)]">{projectStats.requirements}</div>
              <div className="text-[color:var(--color-ash)]">Requirements</div>
            </div>
            <div className="bg-[var(--color-nebula-bg)] rounded-[var(--r-md)] p-3 border border-[var(--color-nebula-hairline-strong)]">
              <div className="type-h3 text-[color:var(--color-accent-green)]">{projectStats.workflows}</div>
              <div className="text-[color:var(--color-ash)]">Workflows</div>
            </div>
            <div className="bg-[var(--color-nebula-bg)] rounded-[var(--r-md)] p-3 border border-[var(--color-nebula-hairline-strong)]">
              <div className="type-h3 text-[color:var(--color-accent-yellow)]">{projectStats.userStories}</div>
              <div className="text-[color:var(--color-ash)]">Stories</div>
            </div>
            <div className="bg-[var(--color-nebula-bg)] rounded-[var(--r-md)] p-3 border border-[var(--color-nebula-hairline-strong)]">
              <div className="type-h3 text-[color:var(--color-nebula-fg)]">{projectStats.mockups}</div>
              <div className="text-[color:var(--color-ash)]">Mockups</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            variant="nebula-ghost"
            onClick={onCancel}
          >
            <Zap className="w-4 h-4 mr-2" />
            Cancel Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}