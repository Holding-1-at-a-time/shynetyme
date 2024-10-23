import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getToken } from '@clerk/nextjs/server'

export async function middleware(request: NextRequest) {
  // Apply rate limiting
  try {
    const limiter = await rateLimit(request)
    const { success, limit, remaining, reset } = await limiter.check()

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      })
    }
  } catch {
    // If rate limiting fails, continue but log the error
    console.error('Rate limiting failed')
  }

  // Verify authentication for protected routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const token = await getToken({ req: request })
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  )

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/self-assessment/:path*',
    '/dashboard/:path*',
  ],
}
