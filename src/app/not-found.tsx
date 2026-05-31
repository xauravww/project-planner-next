"use client";

import Link from "next/link";
import { Glitchy404 } from "@/components/ui/glitchy-404-1";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen w-full bg-[var(--color-nebula-bg)] overflow-hidden flex flex-col items-center justify-center gap-10 p-4">
            <div className="max-w-full overflow-hidden flex justify-center">
                <Glitchy404
                    width={800}
                    height={232}
                    color="var(--color-nebula-fg)"
                    className="w-full max-w-[800px] h-auto"
                />
            </div>
            <p className="type-subtitle text-center max-w-md">
                This page drifted off into the nebula. Let&apos;s get you back.
            </p>
            <Button asChild variant="nebula">
                <Link href="/">Back to home</Link>
            </Button>
        </div>
    );
}
