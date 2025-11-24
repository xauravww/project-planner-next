import { create } from 'zustand';

interface ProjectState {
    currentProjectId: string | null;
    sidebarCollapsed: boolean;
    setCurrentProject: (id: string | null) => void;
    toggleSidebar: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
    currentProjectId: null,
    sidebarCollapsed: false,
    setCurrentProject: (id) => set({ currentProjectId: id }),
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));

interface UIState {
    isGenerating: boolean;
    generatingFor: string | null;
    setGenerating: (isGenerating: boolean, generatingFor?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isGenerating: false,
    generatingFor: null,
    setGenerating: (isGenerating, generatingFor) =>
        set({ isGenerating, generatingFor: generatingFor || null }),
}));
