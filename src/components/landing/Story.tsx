"use client";

import { motion } from "framer-motion";
import { Section, Container } from "@/components/ui/Section";

/**
 * Founder/origin section. 4/8 split — quiet label left, narrative right.
 * No cards. No grid. Editorial.
 */
export function Story() {
    return (
        <Section id="story" glow="orange">
            <Container>
                <div className="grid md:grid-cols-12 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="md:col-span-4 space-y-2"
                    >
                        <p className="type-eyebrow">Why we built this</p>
                        <p className="type-small">A short note from the team.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="md:col-span-8 space-y-6"
                    >
                        <p className="type-h3">
                            Planning a project used to mean ten open tabs, three docs, and a
                            whiteboard photo nobody could read.
                        </p>
                        <p className="type-body-lg">
                            We were that team. Every Monday started with stitching ideas back
                            together — what was the scope again? Who said yes to that feature?
                            Where did the wireframe go?
                        </p>
                        <p className="type-body-lg">
                            So we built one place that holds it all. Drop in a rough idea and
                            NebulaPlan turns it into clear user stories, an architecture map,
                            and a backlog you can ship from. No lost context. No Monday
                            archaeology.
                        </p>
                        <p className="type-body-lg text-[color:var(--color-nebula-fg)]">
                            One home for the whole plan. That&rsquo;s the whole pitch.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                            <span className="w-9 h-9 rounded-full nebula-hairline flex items-center justify-center text-xs font-medium text-[color:var(--color-nebula-fg)]">
                                SC
                            </span>
                            <div>
                                <p className="text-sm text-[color:var(--color-nebula-fg)]">Saurav &middot; Founder</p>
                                <p className="text-xs text-[color:var(--color-ash)]">NebulaPlan</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </Section>
    );
}
