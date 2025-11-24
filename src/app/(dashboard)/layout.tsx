import { Dock } from "@/components/dashboard/Dock";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background relative overflow-auto">
            {/* Background Grid/Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f615,transparent)] pointer-events-none" />

            <main className="relative z-10 min-h-screen">
                {children}
            </main>

            <Dock />
        </div>
    );
}
