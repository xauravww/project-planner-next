import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function seed() {
    console.log("🌱 Seeding database...\n");

    // Create demo user
    const demoEmail = "demo@example.com";
    const demoPassword = "demo123";

    const existingUser = await prisma.user.findUnique({
        where: { email: demoEmail },
    });

    if (existingUser) {
        console.log("Demo user already exists");
        console.log("📧 Email:", demoEmail);
        console.log("🔑 Password:", demoPassword);
        return;
    }

    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    const user = await prisma.user.create({
        data: {
            name: "Demo User",
            email: demoEmail,
            password: hashedPassword,
        },
    });

    console.log("✅ Demo user created:");
    console.log("📧 Email:", demoEmail);
    console.log("🔑 Password:", demoPassword);
    console.log("🆔 User ID:", user.id);

    // Create sample project
    const project = await prisma.project.create({
        data: {
            name: "Sample E-Commerce Project",
            description: "A demo project to showcase the platform features",
            userId: user.id,
            requirements: {
                create: [
                    {
                        title: "User Authentication",
                        content: "Users must be able to sign up, log in, and reset passwords",
                        type: "functional",
                        priority: "must-have",
                    },
                    {
                        title: "Product Catalog",
                        content: "Display products with search, filter, and sorting capabilities",
                        type: "functional",
                        priority: "must-have",
                    },
                    {
                        title: "Responsive Design",
                        content: "App must work on mobile, tablet, and desktop",
                        type: "non-functional",
                        priority: "must-have",
                    },
                ],
            },
        },
    });

    console.log("\n✅ Sample project created:");
    console.log("📁 Project:", project.name);
    console.log("🆔 Project ID:", project.id);

    console.log("\n🎉 Seeding complete!");
    console.log("\n--- Login Credentials ---");
    console.log("Email: demo@example.com");
    console.log("Password: demo123");
    console.log("------------------------");
}

seed()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
