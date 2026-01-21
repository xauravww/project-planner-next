"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Plus,
    LogOut,
} from "lucide-react";

const items = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Plus, label: "New Project", href: "/dashboard/new" },
];

export function Dock() {
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100]">
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="flex h-12 lg:h-16 items-end gap-2 lg:gap-4 rounded-2xl border border-white/10 bg-black/40 px-3 lg:px-4 pb-2 lg:pb-3 backdrop-blur-2xl shadow-2xl shadow-black/50"
            >
                {items.map((item) => (
                    <DockIcon key={item.label} mouseX={mouseX} {...item} />
                ))}
                <div className="h-8 lg:h-10 w-[1px] bg-white/10 mx-1 lg:mx-2 self-center" />
                <SignOutButton mouseX={mouseX} />
            </motion.div>
        </div>
    );
}

function DockIcon({
    mouseX,
    icon: Icon,
    label,
    href,
}: {
    mouseX: any;
    icon: any;
    label: string;
    href: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [32, 64, 32]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link href={href}>
            <motion.div
                ref={ref}
                style={{ width }}
                className="aspect-square rounded-full bg-white/10 border border-white/5 flex items-center justify-center relative group"
            >
                <Icon className="w-1/2 h-1/2 text-white" />
                <span className="absolute -top-14 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                    {label}
                </span>
            </motion.div>
        </Link>
    );
}

function SignOutButton({ mouseX }: { mouseX: any }) {
    const ref = useRef<HTMLButtonElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [32, 64, 32]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <form action="/api/auth/signout" method="post">
            <motion.button
                ref={ref}
                type="submit"
                style={{ width }}
                className="aspect-square rounded-full bg-white/10 border border-white/5 flex items-center justify-center relative group"
            >
                <LogOut className="w-1/2 h-1/2 text-white" />
                <span className="absolute -top-14 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                    Sign Out
                </span>
            </motion.button>
        </form>
    );
}
