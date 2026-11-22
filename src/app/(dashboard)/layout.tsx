import { DashboardMenu } from "@/components/layout/DashboardMenu";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-black">
            <DashboardMenu />
            <main className="relative">{children}</main>
        </div>
    );
}
