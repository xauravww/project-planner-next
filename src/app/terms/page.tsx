import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

const sections: LegalSection[] = [
    {
        heading: "Acceptance of Terms",
        body: "By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.",
    },
    {
        heading: "Use of Services",
        body: "You may use our services only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.",
    },
    {
        heading: "Intellectual Property",
        body: "The content, features, and functionality of our services are owned by NebulaPlan and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.",
    },
    {
        heading: "Termination",
        body: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.",
    },
    {
        heading: "Changes to Terms",
        body: "We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.",
    },
];

export default function TermsPage() {
    return <LegalPage title="Terms of Service" updated="January 2026" sections={sections} />;
}
