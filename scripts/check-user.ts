import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function checkUser() {
    const email = "demo@example.com";
    const password = "demo123";

    console.log("🔍 Checking user...\n");

    // Check database connection
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("✅ Database connection OK");
    } catch (e) {
        console.error("❌ Database connection failed:", e);
        return;
    }

    // Find user
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log("❌ User not found:", email);
        console.log("\n💡 Run this to create the demo user:");
        console.log("npx tsx scripts/seed.ts");
        return;
    }

    console.log("✅ User found:");
    console.log("  ID:", user.id);
    console.log("  Email:", user.email);
    console.log("  Name:", user.name);
    console.log("  Password hash:", user.password.substring(0, 30) + "...");

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log("\n🔑 Password verification:", isValid ? "✅ VALID" : "❌ INVALID");

    if (isValid) {
        console.log("\n✅ Login should work with:");
        console.log("   Email:", email);
        console.log("   Password:", password);
    } else {
        console.log("\n❌ Password doesn't match!");
        console.log("   Expected:", password);
        console.log("   Try re-seeding the database:");
        console.log("   npx tsx scripts/seed.ts");
    }
}

checkUser()
    .catch((e) => {
        console.error("❌ Error:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
