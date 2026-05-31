const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:3001';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Generate embedding with retry logic
 */
export async function generateEmbedding(
    text: string, 
    table: string, 
    id: string,
    retryCount: number = 0
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate inputs
        if (!text || !table || !id) {
            console.warn('Invalid embedding generation params:', { text: !!text, table, id });
            return { success: false, error: 'Invalid parameters' };
        }

        // Truncate very long text to avoid service overload
        const truncatedText = text.length > 8000 ? text.slice(0, 8000) + '...' : text;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${EMBEDDING_SERVICE_URL}/generate-embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: truncatedText, table, id }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Embedding service error: ${response.status} ${response.statusText}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error(`Embedding generation failed (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
        
        // Retry logic
        if (retryCount < MAX_RETRIES - 1) {
            const delay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Retrying embedding generation in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateEmbedding(text, table, id, retryCount + 1);
        }
        
        // Graceful degradation - log but don't fail the operation
        console.error('Embedding generation failed after retries');
        return { success: false, error: error.message };
    }
}

/**
 * Generate multiple embeddings with concurrency control
 */
export async function generateEmbeddings(
    texts: string[], 
    table: string, 
    ids: string[],
    concurrency: number = 3
): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    // Process in batches to avoid overwhelming the service
    for (let i = 0; i < texts.length; i += concurrency) {
        const batch = texts.slice(i, i + concurrency).map((text, index) => 
            generateEmbedding(text, table, ids[i + index])
        );
        
        const batchResults = await Promise.all(batch);
        
        for (const result of batchResults) {
            if (result.success) {
                results.success++;
            } else {
                results.failed++;
            }
        }
        
        // Small delay between batches
        if (i + concurrency < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    if (results.failed > 0) {
        console.warn(`Embedding generation: ${results.success} succeeded, ${results.failed} failed`);
    }
    
    return results;
}

export function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findSimilar(
    queryText: string,
    table: string,
    projectId?: string,
    topK: number = 5
) {
    // Generate embedding for query
    const queryEmbedding = await generateEmbeddingForQuery(queryText);

    // Use pgvector for similarity search
    const result = await prisma.$queryRaw`
        SELECT id, title, content, 1 - (embedding_vector <=> ${queryEmbedding}::vector) as similarity
        FROM ${table}
        WHERE embedding_vector IS NOT NULL
        ${projectId ? prisma.$queryRaw`AND "projectId" = ${projectId}` : prisma.$queryRaw``}
        ORDER BY embedding_vector <=> ${queryEmbedding}::vector
        LIMIT ${topK}
    `;

    return result;
}

// Helper function to generate embedding for queries
async function generateEmbeddingForQuery(text: string): Promise<number[]> {
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/generate-embedding`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(`Embedding service error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
}
