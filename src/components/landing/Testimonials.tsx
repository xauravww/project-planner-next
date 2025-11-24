"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Senior Product Manager",
        content: "NebulaPlan transformed how we handle requirements. The AI suggestions are uncannily accurate and saved us weeks of planning.",
        avatar: "SC",
        className: "md:col-span-1",
    },
    {
        name: "Marcus Rodriguez",
        role: "Tech Lead",
        content: "Finally, a tool that bridges the gap between PMs and devs. The architecture diagrams are a lifesaver.",
        avatar: "MR",
        className: "md:col-span-1",
    },
    {
        name: "Emily Wright",
        role: "Startup Founder",
        content: "We went from idea to MVP in half the time. The structured workflow keeps us focused on what matters. It's like having a CTO in your pocket.",
        avatar: "EW",
        className: "md:col-span-2",
    },
    {
        name: "David Kim",
        role: "Engineering Manager",
        content: "The ability to export directly to Jira is a game changer. No more manual entry.",
        avatar: "DK",
        className: "md:col-span-1",
    },
    {
        name: "Lisa Wang",
        role: "UX Designer",
        content: "The user flow visualization is beautiful. It helps me communicate my design intent clearly to the engineering team.",
        avatar: "LW",
        className: "md:col-span-1",
    },
];

export function Testimonials() {
    return (
        <section className="py-24 bg-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white sm:text-5xl mb-4">
                        Loved by <span className="text-gradient">Builders</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of teams who are shipping faster and better with NebulaPlan.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={testimonial.className}
                        >
                            <GlassCard className="h-full flex flex-col justify-between hover:bg-white/10 transition-colors">
                                <div className="mb-6">
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 italic leading-relaxed">"{testimonial.content}"</p>
                                </div>

                                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{testimonial.name}</h4>
                                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
