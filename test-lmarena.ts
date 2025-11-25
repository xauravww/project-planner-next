import { generateImageWithPuppeteer } from './src/lib/puppeteer-image-gen';

async function testLmarena() {
  const prompt = 'Create a simple mockup of a login page with email and password fields.';
  console.log('Testing lmarena image generation...');
  const result = await generateImageWithPuppeteer(prompt);
  console.log('Result:', result);
}

testLmarena().catch(console.error);