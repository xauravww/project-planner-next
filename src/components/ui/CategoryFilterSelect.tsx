"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export function CategoryFilterSelect({
    categories,
    value,
    onChange,
}: {
    categories: string[];
    value: string | null;
    onChange: (v: string | null) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = q ? categories.filter((c) => c.toLowerCase().includes(q)) : categories;

    return (
        <div ref={ref} className="relative w-full md:w-64">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex h-11 w-full items-center justify-between border-2 border-black bg-white px-3 text-sm text-black outline-none transition-colors focus:border-[#FF4D00]"
            >
                <span className={value ? "text-black" : "text-black/50"}>
                    {value ?? "All categories"}
                </span>
                {value ? (
                    <span className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            aria-label="Clear category filter"
                            className="text-black transition-colors hover:text-[#FF4D00]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                    </span>
                ) : (
                    <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                )}
            </button>

            {open && (
                <div className="absolute z-20 mt-1 w-full border-2 border-black bg-white">
                    <div className="relative border-b-2 border-black">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
                        <input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search category…"
                            className="h-10 w-full bg-white pl-9 pr-3 text-sm text-black placeholder:text-black/40 outline-none"
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                        {filtered.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => {
                                    onChange(c);
                                    setOpen(false);
                                    setQuery("");
                                }}
                                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                                    c === value ? "bg-black text-white" : "hover:bg-black/5"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                        {!filtered.length && (
                            <p className="px-4 py-2 text-sm text-black/50">No categories found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
