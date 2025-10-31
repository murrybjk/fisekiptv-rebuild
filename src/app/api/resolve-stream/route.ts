import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side stream URL resolver
 *
 * Resolves IPTV stream URLs by following redirects server-side.
 * This avoids CORS issues and HEAD request limitations on IPTV servers.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'Missing url parameter' },
      { status: 400 }
    )
  }

  try {
    console.log('[API] Resolving stream URL:', url)

    // Use GET with Range header to minimize bandwidth
    // Many IPTV servers don't support HEAD properly
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Range': 'bytes=0-0', // Request only first byte
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    const finalUrl = response.url
    console.log('[API] Resolved to:', finalUrl)

    return NextResponse.json({
      originalUrl: url,
      resolvedUrl: finalUrl,
      status: response.status,
    })

  } catch (error) {
    console.error('[API] Resolution failed:', error)

    // Fallback: return original URL
    return NextResponse.json({
      originalUrl: url,
      resolvedUrl: url, // Use original if resolution fails
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
