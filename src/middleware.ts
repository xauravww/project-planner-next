import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authLimiter, checkRateLimit } from "@/lib/rate-limit";

// Rate limit auth endpoints
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth endpoints
  if (pathname.startsWith("/api/auth/")) {
    // Get IP from forwarded header or fallback to unknown
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const rateLimit = await checkRateLimit(authLimiter, ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many attempts. Please try again later.",
          retryAfter: rateLimit.retryAfter 
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          }
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match actual auth API endpoints, not error pages
    "/api/auth/signin/:path*",
    "/api/auth/signup/:path*",
    "/api/auth/callback/:path*",
    "/api/auth/signout",
  ],
};
