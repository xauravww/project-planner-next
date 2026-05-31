import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
            retry: 1,
        },
    },
});

// Query keys for cache management
export const queryKeys = {
    projects: {
        all: ["projects"] as const,
        detail: (id: string) => ["projects", id] as const,
        requirements: (id: string) => ["projects", id, "requirements"] as const,
        userStories: (id: string) => ["projects", id, "userStories"] as const,
        workflows: (id: string) => ["projects", id, "workflows"] as const,
        architecture: (id: string) => ["projects", id, "architecture"] as const,
        techStack: (id: string) => ["projects", id, "techStack"] as const,
        mockups: (id: string) => ["projects", id, "mockups"] as const,
        tasks: (id: string) => ["projects", id, "tasks"] as const,
        personas: (id: string) => ["projects", id, "personas"] as const,
        journeys: (id: string) => ["projects", id, "journeys"] as const,
        businessRules: (id: string) => ["projects", id, "businessRules"] as const,
        team: (id: string) => ["projects", id, "team"] as const,
        context: (id: string) => ["projects", id, "context"] as const,
    },
};

// Helper to invalidate project data
export function invalidateProjectData(projectId: string) {
    queryClient.invalidateQueries({
        queryKey: ["projects", projectId],
    });
}

// Helper to invalidate specific module
export function invalidateModule(projectId: string, module: string) {
    queryClient.invalidateQueries({
        queryKey: ["projects", projectId, module],
    });
}
