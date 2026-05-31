"use client";

import Link from "next/link";
import { Section, Container, SectionHeader } from "@/components/ui/Section";

export function CTA() {
    return (
        <Section id="cta" glow="red">
            <Container>
                <SectionHeader
                    align="center"
                    title="Ready to build the"
                    accent="next big thing?"
                    subtitle="Stop planning in scattered docs. Start building with one AI-powered home for your work."
                />

                <div className="flex justify-center">
                    <Link href="/signup" className="nebula-btn nebula-btn--primary">
                        Start planning free
                    </Link>
                </div>
            </Container>
        </Section>
    );
}
