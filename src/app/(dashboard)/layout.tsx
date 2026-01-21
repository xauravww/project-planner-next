import { Dock } from "@/components/dashboard/Dock";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-background relative overflow-hidden">
            {/* Background Grid/Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <main className="relative z-10 h-full w-full overflow-x-hidden">
                {children}
            </main>

            <Dock />
        </div>
    );
}
