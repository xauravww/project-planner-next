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
      <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-700">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Exporting Your Project
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            We&apos;re creating a beautiful PDF of your project documentation
          </DialogDescription>
        </DialogHeader>

        {/* Progress Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{currentStepData.title}</span>
              <span className="text-gray-400">{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          <div className="text-center text-sm text-gray-400">
            {currentStatus === 'completed' ? "Download ready!" :
             currentStatus === 'error' ? "Export failed" :
             "Processing your project..."}
          </div>
        </div>

        {/* Animated Content */}
        <div className="text-center space-y-6 py-4">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <IconComponent className={`w-8 h-8 text-white ${currentStatus === 'completed' ? 'animate-bounce' : 'animate-spin'}`} />
            </div>
          </div>

          {/* Entertaining Message */}
          <div className="min-h-[60px] flex items-center justify-center">
            <p
              key={currentStepIndex}
              className="text-lg font-medium text-white animate-fade-in"
            >
              {currentMessage}
            </p>
          </div>

          {/* Fun Fact */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-300 animate-fade-in" key={funFactIndex}>
              {FUN_FACTS[funFactIndex]}
            </p>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{projectStats.requirements}</div>
              <div className="text-gray-400">Requirements</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{projectStats.workflows}</div>
              <div className="text-gray-400">Workflows</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="text-2xl font-bold text-orange-400">{projectStats.userStories}</div>
              <div className="text-gray-400">Stories</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{projectStats.mockups}</div>
              <div className="text-gray-400">Mockups</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Zap className="w-4 h-4 mr-2" />
            Cancel Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}