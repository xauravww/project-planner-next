import { prisma } from "@/lib/prisma";

/**
 * Transaction wrapper for Prisma operations
 * Ensures atomic operations - all succeed or all fail
 */

export type TransactionCallback<T> = (tx: typeof prisma) => Promise<T>;

/**
 * Execute operations within a database transaction
 * Rolls back on any error
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return await callback(tx as unknown as typeof prisma);
    }, {
      maxWait: 10000, // 10s max wait
      timeout: 30000, // 30s timeout
    });
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return { 
      success: false, 
      error: error.message || "Database transaction failed" 
    };
  }
}

/**
 * Execute operations with retry logic
 * Useful for AI generation that may fail due to temporary issues
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const data = await operation();
      return { success: true, data };
    } catch (error: any) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt + 1}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError?.message || "Operation failed after retries" 
  };
}

/**
 * Combined transaction + retry for critical operations
 */
export async function withTransactionAndRetry<T>(
  callback: TransactionCallback<T>,
  maxRetries: number = 2
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  return withRetry(async () => {
    const result = await withTransaction(callback);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  }, maxRetries);
}
