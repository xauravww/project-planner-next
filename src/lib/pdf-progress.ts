// PDF export progress tracking
interface ProgressData {
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    message: string;
    error?: string;
}

interface PDFData {
    pdf: Uint8Array;
    timestamp: number;
}

const progressStore = new Map<string, ProgressData>();
const pdfStore = new Map<string, PDFData>();

// Cleanup old entries after 30 minutes
const CLEANUP_INTERVAL = 30 * 60 * 1000;

export function setProgress(exportId: string, data: ProgressData): void {
    progressStore.set(exportId, data);
}

export function getProgress(exportId: string): ProgressData {
    return progressStore.get(exportId) || {
        status: 'pending',
        progress: 0,
        message: 'Initializing...'
    };
}

export function setPDF(exportId: string, pdf: Uint8Array): void {
    pdfStore.set(exportId, { pdf, timestamp: Date.now() });
}

export function getPDF(exportId: string): PDFData | null {
    return pdfStore.get(exportId) || null;
}

// Cleanup function
export function cleanupOldExports(): void {
    const now = Date.now();
    for (const [id, data] of pdfStore.entries()) {
        if (now - data.timestamp > CLEANUP_INTERVAL) {
            pdfStore.delete(id);
            progressStore.delete(id);
        }
    }
}

// Run cleanup every 10 minutes
setInterval(cleanupOldExports, 10 * 60 * 1000);
