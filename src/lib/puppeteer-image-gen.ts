import { connect } from "puppeteer-real-browser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    error?: string;
}

export async function generateImageWithPuppeteer(prompt: string): Promise<ImageGenerationResult> {
    console.log(`🤖 Starting image generation for: "${prompt}"`);

    console.log(`🆕 Creating fresh session...`);
    const userDataDir = path.join(__dirname, '..', '..', `lmarena-session-${Date.now()}`);
    const args = ['--no-sandbox', '--disable-setuid-sandbox'];

    try {
        const { browser, page } = await connect({
            headless: false,
            defaultViewport: {
                width: 1280,
                height: 1024
            },
            args: [...args, `--user-data-dir=${userDataDir}`],
            recaptcha: true,
            turnstile: true,
            disableXvfb: true
        });

        try {
            console.log(`🌐 Navigating to LM Arena...`);
            const targetUrl = 'https://lmarena.ai/?mode=direct&chat-modality=image';
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Select the model
            console.log(`🔍 Selecting model...`);
            try {
                await page.click('button[role="combobox"][aria-haspopup="dialog"]:not([data-sentry-source-file="mode-selector.tsx"])');
                console.log(`   ✅ Model dropdown opened`);

                await page.waitForSelector('[cmdk-item]', { timeout: 10000 });
                await new Promise(resolve => setTimeout(resolve, 1000));

                const selectResult = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll('[cmdk-item]'));
                    const ideogram = items.find(item => item.textContent && item.textContent.includes('ideogram-v3-quality'));
                    if (ideogram) {
                        (ideogram as HTMLElement).click();
                        return 'selected';
                    }
                    return 'not found';
                });
                if (selectResult === 'selected') {
                    console.log(`   ✅ Selected model: ideogram-v3-quality`);
                } else {
                    throw new Error('Model not found in dropdown');
                }

                await new Promise(resolve => setTimeout(resolve, 1000));

                // Verify the model is selected
                const selectedModel = await page.evaluate(() => {
                    const button = document.querySelector('button[role="combobox"][aria-haspopup="dialog"]:not([data-sentry-source-file="mode-selector.tsx"])');
                    if (button) {
                        const span = button.querySelector('span.min-w-0.truncate');
                        return span ? span.textContent : null;
                    }
                    return null;
                });
                if (!selectedModel || !selectedModel.includes('ideogram')) {
                    throw new Error(`Model not selected correctly, current: ${selectedModel}`);
                }
                console.log(`   ✅ Confirmed model selected: ${selectedModel}`);
            } catch (error) {
                throw error;
            }

            // Wait for the textarea
            console.log(`🔍 Looking for textarea...`);
            await page.waitForSelector('textarea[name="message"]', { timeout: 10000 });

            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

            console.log(`✍️  Setting prompt: "${prompt}"`);
            await page.click('textarea[name="message"]');

            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

            await page.evaluate((text) => {
                const textarea = document.querySelector('textarea[name="message"]');
                if (textarea) {
                    textarea.value = text;
                    textarea.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, prompt);

            await page.type('textarea[name="message"]', ' ');

            await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

            // Submit
            console.log(`🚀 Clicking submit button...`);

            let submitClicked = false;
            let submitAttempts = 0;
            const maxSubmitAttempts = 3;

            while (!submitClicked && submitAttempts < maxSubmitAttempts) {
                submitAttempts++;
                console.log(`   Attempting to click submit button (attempt ${submitAttempts})...`);

                try {
                    const submitButton = await page.$('button[type="submit"]') ||
                                       await page.$('button.bg-header-primary');

                    if (submitButton) {
                        await submitButton.click();
                        console.log(`   ✅ Submit button clicked`);

                        await new Promise(resolve => setTimeout(resolve, 1000));

                        submitClicked = true;
                    } else {
                        console.log(`   ❌ Submit button not found, retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                } catch (submitError) {
                    console.log(`   ❌ Submit click failed: ${submitError.message}, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (!submitClicked) {
                throw new Error(`Failed to click submit button after ${maxSubmitAttempts} attempts`);
            }

            console.log(`✅ Image generation request submitted!`);
            await page.screenshot({ path: 'after_submit.png', fullPage: true });
            console.log(`📸 Screenshot saved: after_submit.png`);

            // Wait for image
            console.log(`⏳ Waiting for image generation...`);

            let imageUrl = null;
            let waitAttempts = 0;
            const maxWaitAttempts = 60;

            while (!imageUrl && waitAttempts < maxWaitAttempts) {
                waitAttempts++;
                console.log(`   🔍 Checking for generated image (attempt ${waitAttempts}/60)...`);

                try {
                    const imageElement = await page.$('img[data-sentry-source-file="message-attachment.tsx"]');

                    if (imageElement) {
                        imageUrl = await page.evaluate(el => el.getAttribute('src'), imageElement);
                        if (imageUrl && imageUrl.includes('cloudflarestorage.com')) {
                            console.log(`🎉 Image generated successfully!`);
                            break;
                        }
                    }

                    await new Promise(resolve => setTimeout(resolve, 2000));

                } catch (error) {
                    console.log(`   ⚠️  Error checking for image: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            await browser.close();

            // Cleanup session
            try {
                if (fs.existsSync(userDataDir)) {
                    fs.rmSync(userDataDir, { recursive: true, force: true });
                }
            } catch (e) {
                console.warn('Failed to cleanup session directory:', e);
            }

            if (imageUrl) {
                return { success: true, imageUrl };
            } else {
                return { success: false, error: 'Image generation timeout' };
            }

        } catch (error: any) {
            await browser.close();
            throw error;
        }

    } catch (error: any) {
        console.error(`❌ Image generation failed:`, error.message);

        // Cleanup on error
        try {
            if (fs.existsSync(userDataDir)) {
                fs.rmSync(userDataDir, { recursive: true, force: true });
            }
        } catch (e) {
            // Ignore cleanup errors
        }

        return { success: false, error: error.message };
    }
}
