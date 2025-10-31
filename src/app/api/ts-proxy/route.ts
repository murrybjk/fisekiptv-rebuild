import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS Proxy for TS Stream Segments
 *
 * Proxies MPEG-TS stream requests server-side to avoid CORS issues.
 * Many IPTV servers don't send proper CORS headers, blocking browser playback.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('u')

  if (!url) {
    return NextResponse.json(
      { error: 'Missing u parameter' },
      { status: 400 }
    )
  }

  try {
    // Fetch the stream segment server-side
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      // Don't set a timeout - streams need to be continuous
    })

    if (!response.ok) {
      throw new Error(`Stream fetch failed: ${response.status}`)
    }

    // Get the content type
    const contentType = response.headers.get('content-type') || 'video/mp2t'

    // Stream the response back to the client
    const body = response.body

    if (!body) {
      throw new Error('No response body')
    }

    // Return the stream with proper headers
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })

  } catch (error) {
    console.error('[TS-Proxy] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  })
}
