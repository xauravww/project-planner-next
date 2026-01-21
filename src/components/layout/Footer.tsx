"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-zinc-900 bg-black pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="grid gap-12 md:grid-cols-4 lg:gap-24 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-black font-bold">N</div>
                            <span className="text-xl font-bold text-white">NebulaPlan</span>
                        </Link>
                        <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                            The all-in-one platform for visionary builders and product teams.
                            Plan, build, and ship faster than ever before.
                        </p>
                        <div className="flex items-center space-x-4">
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <Github className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Docs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm text-zinc-400">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-900 text-sm text-zinc-500">
                    <p className="mb-4 md:mb-0">
                        © 2024 NebulaPlan Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-white fill-white" />
                        <span>by builders, for builders.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
