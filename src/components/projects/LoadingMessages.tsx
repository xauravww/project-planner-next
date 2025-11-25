"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface LoadingMessagesProps {
    module: string;
}

const MODULE_MESSAGES: Record<string, string[]> = {
    requirements: [
        "Analyzing project scope...",
        "Identifying key features...",
        "Crafting functional requirements...",
        "Defining success criteria...",
    ],
    architecture: [
        "Designing system structure...",
        "Planning component interactions...",
        "Cooking up architecture patterns...",
        "Sketching technical blueprints...",
    ],
    workflows: [
        "Mapping process flows...",
        "Connecting the dots...",
        "Choreographing user journeys...",
        "Optimizing step sequences...",
    ],
    stories: [
        "Writing user narratives...",
        "Defining acceptance criteria...",
        "Prioritizing backlog items...",
        "Estimating story points...",
    ],
    "tech-stack": [
        "Evaluating technology options...",
        "Matching tools to requirements...",
        "Building your tech arsenal...",
        "Selecting optimal frameworks...",
    ],
    tasks: [
        "Breaking down deliverables...",
        "Organizing work items...",
        "Setting up your roadmap...",
        "Planning sprints...",
    ],
    personas: [
        "Profiling user types...",
        "Understanding user needs...",
        "Creating character sketches...",
        "Identifying pain points...",
    ],
    journeys: [
        "Mapping user experiences...",
        "Visualizing interaction flows...",
        "Charting touchpoints...",
        "Designing pathways...",
    ],
    mockups: [
        "Sketching interface concepts...",
        "Generating visual ideas...",
        "Painting UI possibilities...",
        "Crafting screen layouts...",
    ],
    "business-rules": [
        "Defining business logic...",
        "Establishing constraints...",
        "Setting up validations...",
        "Configuring rules engine...",
    ],
    team: [
        "Assembling your squad...",
        "Matching skills to roles...",
        "Building the dream team...",
        "Allocating responsibilities...",
    ],
    default: [
        "Processing your request...",
        "Working on it...",
        "Almost there...",
        "Preparing magic...",
    ],
};

export function LoadingMessages({ module }: LoadingMessagesProps) {
    const messages = MODULE_MESSAGES[module] || MODULE_MESSAGES.default;
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
            </div>
            <div className="h-8 flex items-center justify-center">
                <p className="text-gray-400 text-center animate-fade-in">
                    {messages[currentIndex]}
                </p>
            </div>
        </div>
    );
}
