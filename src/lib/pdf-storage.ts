import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { promisify } from "util";

const sleep = promisify(setTimeout);

export interface ProgressData {
  progress: number;
  status: string;
  message: string;
}

export interface PDFData {
  pdf: Buffer;
  timestamp: number;
}

// Use file system storage instead of memory
const PDF_DIR = process.env.PDF_STORAGE_DIR || path.join(process.cwd(), "tmp", "pdf-exports");
const PROGRESS_DIR = path.join(PDF_DIR, "progress");

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(PDF_DIR, { recursive: true });
    await fs.mkdir(PROGRESS_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to create PDF directories:", error);
  }
}

ensureDirectories();

/**
 * Get file path for PDF storage
 */
function getPDFPath(exportId: string): string {
  // Sanitize exportId to prevent directory traversal
  const sanitized = exportId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(PDF_DIR, `${sanitized}.pdf`);
}

function getProgressPath(exportId: string): string {
  const sanitized = exportId.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(PROGRESS_DIR, `${sanitized}.json`);
}

/**
 * Update progress for a PDF export
 */
export async function updateProgress(
  exportId: string,
  progress: number,
  status: string,
  message: string
): Promise<void> {
  try {
    const data: ProgressData = {
      progress: Math.max(0, Math.min(100, progress)),
      status,
      message,
    };
    await fs.writeFile(getProgressPath(exportId), JSON.stringify(data), "utf-8");
  } catch (error) {
    console.error("Failed to update progress:", error);
  }
}

/**
 * Get progress for a PDF export
 */
export async function getProgress(exportId: string): Promise<ProgressData> {
  try {
    const data = await fs.readFile(getProgressPath(exportId), "utf-8");
    return JSON.parse(data);
  } catch {
    return { progress: 0, status: "idle", message: "Preparing..." };
  }
}

/**
 * Clear progress and PDF data
 */
export async function clearProgress(exportId: string): Promise<void> {
  try {
    await fs.unlink(getProgressPath(exportId)).catch(() => {});
    await fs.unlink(getPDFPath(exportId)).catch(() => {});
  } catch (error) {
    console.error("Failed to clear progress:", error);
  }
}

/**
 * Store PDF data to file system
 */
export async function storePDF(exportId: string, pdf: Buffer): Promise<void> {
  try {
    await fs.writeFile(getPDFPath(exportId), pdf);
    // Also store timestamp in progress
    await updateProgress(exportId, 100, "completed", "PDF ready for download!");
  } catch (error) {
    console.error("Failed to store PDF:", error);
    throw new Error("Failed to store PDF");
  }
}

/**
 * Get PDF data from file system
 */
export async function getPDF(exportId: string): Promise<PDFData | undefined> {
  try {
    const [pdf, stats] = await Promise.all([
      fs.readFile(getPDFPath(exportId)),
      fs.stat(getPDFPath(exportId)),
    ]);
    return {
      pdf,
      timestamp: stats.mtime.getTime(),
    };
  } catch {
    return undefined;
  }
}

/**
 * Clean up old PDF files
 */
export async function cleanupOldData(maxAge: number = 3600000): Promise<number> {
  try {
    const now = Date.now();
    const files = await fs.readdir(PDF_DIR);
    let cleaned = 0;

    for (const file of files) {
      if (!file.endsWith(".pdf")) continue;
      
      const filePath = path.join(PDF_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        // Also delete progress file
        const exportId = file.replace(".pdf", "");
        await fs.unlink(getProgressPath(exportId)).catch(() => {});
        cleaned++;
      }
    }

    return cleaned;
  } catch (error) {
    console.error("Failed to cleanup old PDFs:", error);
    return 0;
  }
}

// Run cleanup every hour
if (typeof window === "undefined") {
  setInterval(() => cleanupOldData(), 3600000);
}
