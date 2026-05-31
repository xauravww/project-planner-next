import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

const sections: LegalSection[] = [
    {
        heading: "Introduction",
        body: 'NebulaPlan ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our websites and services.',
    },
    {
        heading: "Information We Collect",
        body: "We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or request customer support. This may include your name, email address, and payment information.",
    },
    {
        heading: "How We Use Your Information",
        body: "We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you.",
    },
    {
        heading: "Data Security",
        body: "We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.",
    },
    {
        heading: "Contact Us",
        body: "If you have any questions about this Privacy Policy, please contact us at privacy@nebulaplan.com.",
    },
];

export default function PrivacyPage() {
    return <LegalPage title="Privacy Policy" updated="January 2026" sections={sections} />;
}
