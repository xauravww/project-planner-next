import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";

// Use memory store for development, Redis for production
const useRedis = process.env.REDIS_URL && process.env.NODE_ENV === "production";

// AI generation rate limiter: 10 requests per minute per user
export const aiGenerationLimiter = useRedis && process.env.REDIS_URL
  ? new RateLimiterRedis({
      storeClient: process.env.REDIS_URL,
      keyPrefix: "ai_gen",
      points: 10,
      duration: 60,
    })
  : new RateLimiterMemory({
      keyPrefix: "ai_gen",
      points: 10,
      duration: 60,
    });

// Chat API rate limiter: 30 requests per minute per user
export const chatLimiter = useRedis && process.env.REDIS_URL
  ? new RateLimiterRedis({
      storeClient: process.env.REDIS_URL,
      keyPrefix: "chat",
      points: 30,
      duration: 60,
    })
  : new RateLimiterMemory({
      keyPrefix: "chat",
      points: 30,
      duration: 60,
    });

// Auth rate limiter: 5 attempts per 15 minutes per IP
export const authLimiter = useRedis && process.env.REDIS_URL
  ? new RateLimiterRedis({
      storeClient: process.env.REDIS_URL,
      keyPrefix: "auth",
      points: 5,
      duration: 15 * 60,
    })
  : new RateLimiterMemory({
      keyPrefix: "auth",
      points: 5,
      duration: 15 * 60,
    });

// PDF export rate limiter: 3 exports per 10 minutes per user
export const pdfExportLimiter = useRedis && process.env.REDIS_URL
  ? new RateLimiterRedis({
      storeClient: process.env.REDIS_URL,
      keyPrefix: "pdf",
      points: 3,
      duration: 10 * 60,
    })
  : new RateLimiterMemory({
      keyPrefix: "pdf",
      points: 3,
      duration: 10 * 60,
    });

/**
 * Check rate limit for a user
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }
 */
export async function checkRateLimit(
  limiter: RateLimiterMemory | RateLimiterRedis,
  key: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    await limiter.consume(key);
    return { allowed: true };
  } catch (rejRes: any) {
    return {
      allowed: false,
      retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 60,
    };
  }
}
