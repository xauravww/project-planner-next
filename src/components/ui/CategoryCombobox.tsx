"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, Plus, X } from "lucide-react";

const MAX_DEFAULT = 5;

export function CategoryCombobox({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options.slice(0, MAX_DEFAULT);
    const canAdd = Boolean(q) && !options.some((o) => o.toLowerCase() === q);

    const select = (v: string) => {
        onChange(v);
        setOpen(false);
        setQuery("");
    };

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex h-12 w-full items-center justify-between border-2 border-black bg-white px-4 text-sm text-black outline-none transition-colors focus:border-[#FF4D00]"
            >
                <span className={value ? "text-black" : "text-black/40"}>
                    {value || "Select category"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
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
                            className="h-11 w-full bg-white pl-10 pr-9 text-sm text-black placeholder:text-black/40 outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="max-h-56 overflow-y-auto py-1">
                        {filtered.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onClick={() => select(opt)}
                                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                                    opt === value ? "bg-black text-white" : "hover:bg-black/5"
                                }`}
                            >
                                {opt}
                            </button>
                        ))}

                        {canAdd && (
                            <button
                                type="button"
                                onClick={() => select(q)}
                                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#FF4D00] transition-colors hover:bg-black/5"
                            >
                                <Plus className="h-4 w-4" />
                                Add &quot;{q}&quot;
                            </button>
                        )}

                        {!filtered.length && !canAdd && (
                            <p className="px-4 py-2 text-sm text-black/50">No categories found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
