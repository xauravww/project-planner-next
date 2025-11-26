const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testMermaidRendering() {
    console.log('🧪 Starting Mermaid PDF Rendering Test\n');

    let browser;
    try {
        // HTML content with Mermaid diagram
        const testHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mermaid Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .mermaid {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #ddd;
            margin: 20px 0;
            text-align: center;
        }
        .test-section {
            margin: 30px 0;
            padding: 20px;
            background: #f0f8ff;
            border-left: 4px solid #667eea;
        }
    </style>
</head>
<body>
    <h1>Mermaid Rendering Test</h1>
    
    <div class="test-section">
        <h2>Test Diagram 1: Simple Flowchart</h2>
        <div class="mermaid">
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]
        </div>
    </div>
    
    <div class="test-section">
        <h2>Test Diagram 2: Sequence Diagram</h2>
        <div class="mermaid">
sequenceDiagram
    participant User
    participant Server
    participant Database
    User->>Server: Request
    Server->>Database: Query
    Database-->>Server: Data
    Server-->>User: Response
        </div>
    </div>
    
    <div class="test-section">
        <h2>Test Diagram 3: Architecture Diagram</h2>
        <div class="mermaid">
graph LR
    A[Frontend] --> B[API Gateway]
    B --> C[Backend Service]
    B --> D[Auth Service]
    C --> E[Database]
    D --> E
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        console.log('📦 Mermaid script loaded');
        
        if (typeof mermaid !== 'undefined') {
            console.log('✅ Mermaid is available');
            console.log('📊 Mermaid version:', mermaid.version || 'unknown');
            
            mermaid.initialize({ 
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose'
            });
            console.log('⚙️  Mermaid initialized');
        } else {
            console.error('❌ Mermaid is NOT available');
        }
    </script>
</body>
</html>
        `.trim();

        // Find Chrome executable
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
            process.env.CHROME_BIN ||
            '/usr/bin/google-chrome-stable' ||
            '/usr/bin/chromium-browser' ||
            '/usr/bin/chromium';

        console.log(`🚀 Launching browser at: ${executablePath}\n`);

        browser = await puppeteer.launch({
            executablePath,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ],
        });

        const page = await browser.newPage();

        // Enable console logging from the page
        page.on('console', msg => {
            const type = msg.type();
            const text = msg.text();
            const icon = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '📝';
            console.log(`  ${icon} [Browser Console] ${text}`);
        });

        // Set longer timeout
        page.setDefaultTimeout(90000);

        // Intercept requests
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (['media', 'font'].includes(resourceType)) {
                request.abort();
            } else {
                console.log(`  📥 Loading: ${request.resourceType()} - ${request.url().substring(0, 80)}...`);
                request.continue();
            }
        });

        page.on('requestfailed', (request) => {
            console.log(`  ❌ Failed: ${request.url()}`);
        });

        console.log('📄 Setting page content...');
        await page.setContent(testHTML, {
            waitUntil: 'load',
            timeout: 90000
        });
        console.log('✅ Page content loaded\n');

        // Check for Mermaid diagrams
        const mermaidDiagramCount = await page.evaluate(() => {
            return document.querySelectorAll('.mermaid').length;
        });
        console.log(`📊 Found ${mermaidDiagramCount} Mermaid diagram containers\n`);

        // Wait for Mermaid to load
        console.log('⏳ Waiting for Mermaid script to load...');
        const mermaidLoadResult = await page.waitForFunction(() => {
            return typeof window.mermaid !== 'undefined';
        }, { timeout: 20000 }).catch((err) => {
            console.error(`❌ Mermaid script failed to load: ${err.message}`);
            return false;
        });

        // Check if Mermaid loaded
        const mermaidLoaded = await page.evaluate(() => {
            return typeof window.mermaid !== 'undefined';
        });
        console.log(`${mermaidLoaded ? '✅' : '❌'} Mermaid loaded: ${mermaidLoaded}\n`);

        if (mermaidLoaded) {
            // Get Mermaid version
            const mermaidVersion = await page.evaluate(() => {
                return window.mermaid?.version || 'unknown';
            });
            console.log(`📦 Mermaid version: ${mermaidVersion}\n`);
        }

        // Wait a bit for initialization
        console.log('⏳ Waiting for Mermaid to initialize (2s)...');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

        // Manually trigger Mermaid rendering
        console.log('🎨 Attempting to initialize Mermaid diagrams...');
        const initResult = await page.evaluate(() => {
            if (typeof window.mermaid !== 'undefined') {
                try {
                    const diagrams = document.querySelectorAll('.mermaid');
                    console.log(`Found ${diagrams.length} .mermaid elements`);
                    window.mermaid.init(undefined, diagrams);
                    return { success: true, count: diagrams.length };
                } catch (error) {
                    console.error('Mermaid init error:', error);
                    return { success: false, error: error.message };
                }
            } else {
                return { success: false, error: 'Mermaid not loaded' };
            }
        }).catch((err) => {
            console.error(`❌ Mermaid init failed: ${err.message}`);
            return { success: false, error: err.message };
        });
        console.log(`${initResult.success ? '✅' : '❌'} Mermaid init result:`, JSON.stringify(initResult), '\n');

        // Wait for rendering
        console.log('⏳ Waiting for diagrams to render (3s)...');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));

        // Check if diagrams rendered
        const svgCount = await page.evaluate(() => {
            const svgs = document.querySelectorAll('.mermaid svg');
            return svgs.length;
        });
        console.log(`📊 Rendered ${svgCount} SVG diagrams out of ${mermaidDiagramCount} total\n`);

        // Get details about rendered diagrams
        const diagramDetails = await page.evaluate(() => {
            const details: any[] = [];
            document.querySelectorAll('.mermaid').forEach((el, idx) => {
                const svg = el.querySelector('svg');
                details.push({
                    index: idx,
                    hasSVG: !!svg,
                    textContent: el.textContent?.substring(0, 50),
                    innerHTML: el.innerHTML.substring(0, 100)
                });
            });
            return details;
        });
        console.log('📋 Diagram details:');
        diagramDetails.forEach(d => {
            console.log(`  Diagram ${d.index}: ${d.hasSVG ? '✅ SVG rendered' : '❌ No SVG'}`);
            console.log(`    Content: ${d.textContent?.trim().substring(0, 30)}...`);
        });
        console.log('');

        // Take screenshot
        const screenshotPath = path.join(__dirname, 'mermaid-test-screenshot.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });
        console.log(`📸 Screenshot saved: ${screenshotPath}\n`);

        // Generate PDF
        console.log('📄 Generating PDF...');
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm',
            },
        });

        const pdfPath = path.join(__dirname, 'mermaid-test.pdf');
        fs.writeFileSync(pdfPath, pdf);
        console.log(`✅ PDF generated: ${pdfPath}`);
        console.log(`📦 PDF size: ${pdf.length} bytes\n`);

        await browser.close();

        console.log('='.repeat(60));
        console.log('🎯 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Diagrams found:    ${mermaidDiagramCount}`);
        console.log(`Mermaid loaded:    ${mermaidLoaded ? '✅ Yes' : '❌ No'}`);
        console.log(`Init successful:   ${initResult.success ? '✅ Yes' : '❌ No'}`);
        console.log(`SVGs rendered:     ${svgCount}/${mermaidDiagramCount}`);
        console.log(`Screenshot:        ${screenshotPath}`);
        console.log(`PDF:               ${pdfPath}`);
        console.log('='.repeat(60));

        if (svgCount === mermaidDiagramCount && svgCount > 0) {
            console.log('\n🎉 SUCCESS! All Mermaid diagrams rendered correctly!');
        } else if (svgCount > 0) {
            console.log(`\n⚠️  PARTIAL SUCCESS: ${svgCount}/${mermaidDiagramCount} diagrams rendered`);
        } else {
            console.log('\n❌ FAILURE: No diagrams rendered. Check the logs above for errors.');
        }

    } catch (error) {
        console.error('\n💥 Test failed with error:', error);
        if (browser) {
            await browser.close().catch(() => { });
        }
        process.exit(1);
    }
}

// Run the test
testMermaidRendering();
