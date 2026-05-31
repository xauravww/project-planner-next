"use client";

import { motion } from "framer-motion";
import { Section, Container, SectionHeader } from "@/components/ui/Section";
import { CodeWindow } from "@/components/ui/CodeWindow";

/**
 * Code-story split. Resend's signature rhythm:
 *   narrative copy on the left, code window on the right,
 *   stacking under 1024px (code well always second).
 */
export function Demo() {
    return (
        <Section id="demo" glow="blue">
            <Container>
                <SectionHeader
                    title="Plan in plain English."
                    accent="Get back code."
                    subtitle="Describe what you want. NebulaPlan generates user stories, an architecture map, and tasks you can hand straight to your team."
                />

                <div className="grid lg:grid-cols-2 gap-[var(--space-xxl)] items-start">
                    {/* narrative */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5 }}
                        className="space-y-[var(--space-xl)]"
                    >
                        {[
                            {
                                title: "One prompt, one plan",
                                body: "Drop in a one-liner. The AI returns a structured plan you can edit, share, and export.",
                            },
                            {
                                title: "Auto-architecture",
                                body: "We sketch the system diagram while you write — components, edges, data shapes.",
                            },
                            {
                                title: "Ship straight to your tools",
                                body: "Export tasks to Linear, Jira, or GitHub Issues. Or grab the scaffolding as code.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="space-y-2">
                                <h3 className="type-h3">{item.title}</h3>
                                <p className="type-body-lg">{item.body}</p>
                            </div>
                        ))}
                    </motion.div>

                    {/* code window */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <CodeWindow tabs={["plan.ts", "stories.json"]}>
                            <pre className="whitespace-pre text-[length:var(--nebula-code)]">
{`import { NebulaPlan } from "nebulaplan";

const plan = await NebulaPlan.create({
  idea: "A saas for indie founders to plan launches.",
  format: "stories+architecture",
});

console.log(plan.stories);
//  [
//    { id: "S-01", title: "Founder signs up",
//      acceptance: ["email verified", "workspace created"] },
//    { id: "S-02", title: "Founder drafts launch checklist", ... },
//  ]

await plan.exportTo("linear", { team: "GROWTH" });`}
                            </pre>
                        </CodeWindow>
                    </motion.div>
                </div>
            </Container>
        </Section>
    );
}
