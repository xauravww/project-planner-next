"use client";

import { Glitchy404 } from "@/components/ui/glitchy-404-1";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center p-4">
            <div className="max-w-full overflow-hidden flex justify-center">
                <Glitchy404
                    width={800}
                    height={232}
                    color="#fff"
                    className="w-full max-w-[800px] h-auto" // Added responsive class
                />
            </div>
        </div>
    );
}
