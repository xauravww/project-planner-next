// Shared progress tracking for PDF exports
// In production, use Redis or database instead of in-memory storage

export interface ProgressData {
    progress: number;
    status: string;
    message: string;
}

export interface PDFData {
    pdf: Buffer;
    timestamp: number;
}

const progressStore = new Map<string, ProgressData>();
const pdfStore = new Map<string, PDFData>();

export function updateProgress(exportId: string, progress: number, status: string, message: string) {
    progressStore.set(exportId, { progress, status, message });
}

export function getProgress(exportId: string): ProgressData {
    return progressStore.get(exportId) || { progress: 0, status: 'idle', message: 'Preparing...' };
}

export function clearProgress(exportId: string) {
    progressStore.delete(exportId);
    pdfStore.delete(exportId);
}

export function storePDF(exportId: string, pdf: Buffer) {
    pdfStore.set(exportId, { pdf, timestamp: Date.now() });
}

export function getPDF(exportId: string): PDFData | undefined {
    return pdfStore.get(exportId);
}

// Clean up old data (call this periodically)
export function cleanupOldData(maxAge: number = 3600000) { // 1 hour default
    const now = Date.now();
    for (const [key, data] of pdfStore.entries()) {
        if (now - data.timestamp > maxAge) {
            pdfStore.delete(key);
            progressStore.delete(key);
        }
    }
}