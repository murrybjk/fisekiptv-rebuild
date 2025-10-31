"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { usePlayerStore } from "@/store/player"
import { CheckCircle2, PlayCircle } from "lucide-react"

// Dynamic import for VideoPlayer to prevent SSR hydration issues with Video.js
const VideoPlayer = dynamic(
  () => import("@/components/features/video-player").then(mod => ({ default: mod.VideoPlayer })),
  {
    ssr: false,
    loading: () => (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading player...</div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

/**
 * STREAM TESTING PAGE
 *
 * Tests both HLS (.m3u8) and raw TS stream formats
 * Uses the main VideoPlayer component with actual IPTV URLs
 */
export default function TestStreamsPage() {
  const { setStream } = usePlayerStore()
  const [testResults, setTestResults] = useState<string[]>([])

  const log = (message: string) => {
    console.log(`[TEST] ${message}`)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testHLSStream = () => {
    const hlsUrl = "http://aihxvzbw.atlas-pro.xyz:88/live/XCVHJKOP1234/LE3FV5LU/185619.m3u8"
    log('🎬 Testing HLS Stream (.m3u8)')
    log(`📍 URL: ${hlsUrl}`)

    setStream(hlsUrl, "Test HLS Channel", "HLS Format (.m3u8)")
    log('✅ HLS stream sent to player')
    log('📺 Watch the video player below')
  }

  const testTSStream = () => {
    const tsUrl = "http://aihxvzbw.atlas-pro.xyz:88/XCVHJKOP1234/LE3FV5LU/185619"
    log('🎬 Testing Raw TS Stream')
    log(`📍 URL: ${tsUrl}`)

    setStream(tsUrl, "Test TS Channel", "Raw MPEG-TS Format")
    log('✅ TS stream sent to player')
    log('📺 Watch the video player below')
  }

  const clearLog = () => {
    setTestResults([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Video Player - Always visible */}
      <VideoPlayer />

      <Card>
        <CardHeader>
          <CardTitle>🧪 Stream Format Testing</CardTitle>
          <CardDescription>
            Test both HLS (.m3u8) and raw MPEG-TS stream formats with automatic URL resolution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* HLS Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              HLS Stream Test (.m3u8)
            </h3>
            <p className="text-sm text-muted-foreground">
              Tests HTTP Live Streaming format - handled by Video.js
            </p>
            <code className="block text-xs bg-muted p-2 rounded">
              http://aihxvzbw.atlas-pro.xyz:88/live/XCVHJKOP1234/LE3FV5LU/185619.m3u8
            </code>
            <Button onClick={testHLSStream} className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              Test HLS Stream
            </Button>
          </div>

          {/* TS Test */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              Raw TS Stream Test
            </h3>
            <p className="text-sm text-muted-foreground">
              Tests raw MPEG-TS format - handled by mpegts.js
            </p>
            <code className="block text-xs bg-muted p-2 rounded">
              http://aihxvzbw.atlas-pro.xyz:88/XCVHJKOP1234/LE3FV5LU/185619
            </code>
            <Button onClick={testTSStream} variant="secondary" className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              Test Raw TS Stream
            </Button>
          </div>

          {/* Instructions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">How It Works:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click either test button above</li>
              <li>Stream URL will be resolved (follows redirects to get token)</li>
              <li>Player auto-selects appropriate format (mpegts.js or Video.js)</li>
              <li>Video player below will start playing the stream</li>
              <li>Check browser console (F12) for detailed logs</li>
            </ol>
          </div>

          {/* Clear Log */}
          <Button onClick={clearLog} variant="outline" className="w-full">
            Clear Test Log
          </Button>
        </CardContent>
      </Card>

      {/* Test Log */}
      <Card>
        <CardHeader>
          <CardTitle>Test Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-[300px] overflow-auto">
            {testResults.length === 0 ? (
              <p>No tests run yet. Click a test button above to start.</p>
            ) : (
              testResults.map((result, i) => (
                <div key={i}>{result}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Info */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold mb-1">URL Resolution:</h4>
            <p className="text-muted-foreground">
              Both URLs will be resolved using <code className="bg-muted px-1">StreamResolver</code> to follow redirects and obtain the final tokenized URL.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Player Selection:</h4>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li><strong>HLS (.m3u8):</strong> Uses Video.js with http-streaming plugin</li>
              <li><strong>Raw TS:</strong> Uses mpegts.js for live MPEG-TS streams</li>
              <li><strong>Fallback:</strong> If mpegts.js fails, falls back to Video.js</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Check Console:</h4>
            <p className="text-muted-foreground">
              Open browser DevTools (F12) → Console tab to see detailed playback logs including:
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside mt-1">
              <li>URL resolution process</li>
              <li>Stream type detection</li>
              <li>Player selection (mpegts.js vs Video.js)</li>
              <li>Playback status and errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
