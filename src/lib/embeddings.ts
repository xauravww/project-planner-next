const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://localhost:3001';

export async function generateEmbedding(text: string, table: string, id: string): Promise<void> {
    try {
        const response = await fetch(`${EMBEDDING_SERVICE_URL}/generate-embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, table, id }),
        });

        if (!response.ok) {
            throw new Error(`Embedding service error: ${response.statusText}`);
        }

        // Service stores directly in DB, no return needed
    } catch (error) {
        console.error('Failed to generate embedding:', error);
        // Continue without embedding - graceful degradation
    }
}

export async function generateEmbeddings(texts: string[], table: string, ids: string[]): Promise<void> {
    await Promise.all(texts.map((text, index) => generateEmbedding(text, table, ids[index])));
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
