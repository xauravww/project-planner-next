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
        <nav className="flex items-center space-x-2 text-sm px-3 py-2 sm:px-4 sm:py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mb-4 sm:mb-6 inline-flex">
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center flex-shrink-0 text-zinc-300">
                <Home className="w-4 h-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 min-w-0 flex-1">
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-white transition-colors truncate max-w-[200px] lg:max-w-[300px] text-zinc-300"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className="text-white font-medium truncate max-w-[200px] lg:max-w-[300px]"
                            title={item.label}
                        >
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
