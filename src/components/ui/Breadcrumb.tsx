"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-tight sm:mb-6">
            <Link href="/dashboard" className="flex items-center text-black transition-colors hover:text-[#FF4D00]">
                <Home className="h-4 w-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex min-w-0 items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-black/40" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="truncate max-w-[200px] text-black transition-colors hover:text-[#FF4D00] lg:max-w-[300px]"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="truncate max-w-[200px] font-medium text-black lg:max-w-[300px]" title={item.label}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
