
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local...');
    dotenv.config({ path: envPath });
} else {
    console.log('.env.local not found, trying .env');
    dotenv.config();
}

const API_URL = process.env.NEXT_PUBLIC_AI_API_URL;
const API_TOKEN = process.env.NEXT_PUBLIC_AI_TOKEN;

async function testImageGen() {
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Checking for .env.local at: ${envPath}`);
    console.log(`File exists: ${fs.existsSync(envPath)}`);
    console.log(`NEXT_PUBLIC_AI_API_URL: ${API_URL}`);
    console.log(`NEXT_PUBLIC_AI_TOKEN: ${API_TOKEN ? API_TOKEN.substring(0, 10) + "..." : "UNDEFINED"}`);

    if (!API_URL || !API_TOKEN) {
        console.error("Missing configuration");
        return;
    }

    console.log(`Testing Image Gen at: ${API_URL}/v1/images/generations`);
    console.log(`Using Token: ${API_TOKEN?.substring(0, 8)}...`);

    if (!API_URL) {
        console.error("ERROR: NEXT_PUBLIC_AI_API_URL is not set.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/v1/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({
                prompt: "A cute robot coding, vector art",
                n: 1,
                size: "1024x1024"
            })
        });

        if (!response.ok) {
            console.error(`FAILED: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
        } else {
            const data = await response.json();
            console.log("SUCCESS!");
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("EXCEPTION:", error);
    }
}

testImageGen();
