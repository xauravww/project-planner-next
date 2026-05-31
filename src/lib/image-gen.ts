import "dotenv/config";

const baseURL = (process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:3010") + "/v1";
const token = process.env.NEXT_PUBLIC_AI_TOKEN || process.env.NEXT_PUBLIC_AI_API_KEY || "";

export interface ImageGenerationOptions {
    prompt: string;
    model?: string; // Optional: if not provided, will auto-select (flux)
}

export interface ImageGenerationResponse {
    data: Array<{
        url?: string;
        b64_json?: string;
    }>;
    created?: number;
}

/**
 * Generate an image using the local AI API
 * By default auto-selects flux model if no model is specified
 */
export async function generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
    const url = `${baseURL}/images/generations`;
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };

    const body: any = {
        prompt: options.prompt
    };

    // Only include model if explicitly specified
    if (options.model) {
        body.model = options.model;
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Image Generation Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Generate an image and return the URL or base64 data
 */
export async function generateImageUrl(prompt: string, model?: string): Promise<string> {
    const response = await generateImage({ prompt, model });

    if (response.data && response.data.length > 0) {
        const imageData = response.data[0];
        return imageData.url || `data:image/png;base64,${imageData.b64_json}`;
    }

    throw new Error("No image data returned from API");
}

/**
 * Test the image generation API connection
 */
export async function testImageGenConnection() {
    try {
        const response = await generateImage({
            prompt: "A simple test image"
        });

        return {
            success: true,
            message: "Image generation API is working",
            imageUrl: response.data?.[0]?.url || response.data?.[0]?.b64_json ? "base64 data" : null,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}
