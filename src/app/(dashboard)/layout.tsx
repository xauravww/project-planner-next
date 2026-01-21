
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-black relative overflow-hidden">

            <main className="relative z-10 h-full w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
