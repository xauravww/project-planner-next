const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not defined in .env.local");
} else {
    // Mask password in log
    const maskedUrl = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
    console.log("DATABASE_URL found:", maskedUrl);
}

const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to connect to Prisma...");
    try {
        await prisma.$connect();
        console.log("✅ Successfully connected to database.");

        console.log("Querying User count...");
        const count = await prisma.user.count();
        console.log("User count:", count);

    } catch (e) {
        console.error("❌ Connection failed!");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
