import Link from "next/link";
import { NebulaButton } from "@/components/ui/NebulaButton";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
            <p className="font-mono text-xs uppercase tracking-tight text-[#FF4D00]">Error 404</p>
            <h1 className="type-display mt-4 text-[length:clamp(3rem,12vw,10rem)]">Lost</h1>
            <div className="mx-auto mt-4 h-1 w-10 bg-[#FF4D00]" />
            <p className="mt-5 max-w-md text-black/70">
                The page you&apos;re looking for doesn&apos;t exist.
            </p>
            <div className="mt-8">
                <NebulaButton href="/" size="lg">
                    Back to home
                </NebulaButton>
            </div>
        </div>
    );
}
