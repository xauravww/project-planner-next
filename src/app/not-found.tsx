import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#3b82f615,transparent)]" />

            <GlassCard className="max-w-md w-full p-8 text-center relative z-10">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">404</h1>
                <h2 className="text-xl font-semibold text-gray-300 mb-4">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The page you are looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
            </GlassCard>
        </div>
    );
}
