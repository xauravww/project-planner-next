"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export function SearchInput() {
    const [value, setValue] = useState("");

    return (
        <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search projects"
                className="h-11 w-full border-2 border-black bg-white pl-10 pr-10 text-sm text-black placeholder:text-black/40 outline-none transition-colors focus:border-[#FF4D00]"
            />
            {value ? (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setValue("")}
                    className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-black transition-colors hover:text-[#FF4D00]"
                >
                    <X className="h-4 w-4" />
                </button>
            ) : null}
        </div>
    );
}
