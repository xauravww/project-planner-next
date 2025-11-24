import { pipeline, env } from "@xenova/transformers";

// Disable local model loading for serverless environments
env.allowLocalModels = false;

let embeddingPipeline: any = null;

export async function initEmbeddings() {
    if (!embeddingPipeline) {
        embeddingPipeline = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return embeddingPipeline;
}

export async function generateEmbedding(text: string): Promise<number[]> {
    const pipe = await initEmbeddings();
    const output = await pipe(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await Promise.all(texts.map(text => generateEmbedding(text)));
    return embeddings;
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

export async function findSimilar(
    queryText: string,
    candidates: Array<{ text: string; embedding?: string; id: string }>,
    topK: number = 5
) {
    const queryEmbedding = await generateEmbedding(queryText);

    const similarities = candidates.map((candidate) => {
        const embedding = candidate.embedding
            ? JSON.parse(candidate.embedding)
            : null;

        if (!embedding) {
            return { ...candidate, similarity: 0 };
        }

        const similarity = cosineSimilarity(queryEmbedding, embedding);
        return { ...candidate, similarity };
    });

    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
}
