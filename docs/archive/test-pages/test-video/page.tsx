"use client"

import { useEffect, useRef, useState } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import "@videojs/http-streaming"
import type Player from "video.js/dist/types/player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StreamResolver } from "@/lib/stream-resolver"

/**
 * ISOLATED VIDEO PLAYER TEST PAGE
 *
 * Purpose: Test Video.js rendering and HLS playback in isolation
 * No Zustand, no complex state, just pure video player testing
 */
export default function TestVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const log = (message: string) => {
    console.log(`[TEST] ${message}`)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Initialize player
  useEffect(() => {
    if (!videoRef.current) {
      log("❌ Video ref is null!")
      return
    }

    log("🎥 Initializing Video.js player...")

    try {
      const player = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        responsive: true,
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        html5: {
          vhs: {
            overrideNative: true,
            enableLowInitialPlaylist: true,
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false,
        },
      })

      player.on('error', () => {
        const playerError = player.error()
        log(`❌ Player error: ${playerError?.message || 'Unknown error'}`)
      })

      player.on('ready', () => {
        log("✅ Video.js player is ready")
        setIsPlayerReady(true)
      })

      player.on('loadedmetadata', () => {
        log("✅ Metadata loaded")
      })

      player.on('playing', () => {
        log("✅ Playback started")
      })

      playerRef.current = player
      log("✅ Player reference stored")
    } catch (error) {
      log(`❌ Error initializing player: ${error}`)
    }

    return () => {
      if (playerRef.current) {
        log("🧹 Cleaning up player")
        playerRef.current.dispose()
        playerRef.current = null
      }
      setIsPlayerReady(false)
    }
  }, [])

  const loadTestStream = async (customUrl?: string) => {
    if (!playerRef.current) {
      log("❌ Player not initialized")
      return
    }

    if (!isPlayerReady) {
      log("❌ Player not ready yet")
      return
    }

    const player = playerRef.current

    // Use the IPTV TS stream
    const originalUrl = customUrl || "http://aihxvzbw.atlas-pro.xyz:88/XCVHJKOP1234/LE3FV5LU/185619"

    log(`🎥 Loading IPTV stream...`)
    log(`📍 Original URL: ${originalUrl}`)

    // Resolve URL to get the final tokenized URL
    log(`🔄 Resolving URL (following redirects)...`)
    let finalUrl: string

    try {
      finalUrl = await StreamResolver.resolveStreamUrl(originalUrl)
      log(`✅ Resolved URL: ${finalUrl}`)
    } catch (error) {
      log(`❌ URL resolution failed: ${error}`)
      finalUrl = originalUrl
    }

    // Reset player
    player.pause()
    player.reset()

    // For raw MPEG-TS streams (like IPTV), use application/x-mpegURL type
    // Video.js http-streaming plugin will handle it
    player.src({
      src: finalUrl,
      type: 'application/x-mpegURL'  // This tells VHS to handle it as a streamable format
    })

    log("📡 Source set, loading...")
    player.load()

    log("▶️ Attempting to play...")

    // Try to play
    const playPromise = player.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          log("✅ Playback started successfully!")
        })
        .catch(error => {
          log(`⚠️ Playback error: ${error.name} - ${error.message}`)
          // If autoplay fails, that's okay - user can click play
        })
    }
  }

  // Expose loadTestStream to window for Playwright testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).loadTestStream = loadTestStream
    }
  }, [isPlayerReady])

  const checkDOMElements = () => {
    const videoElements = document.querySelectorAll('video')
    const vjsPlayerDivs = document.querySelectorAll('[data-vjs-player]')
    const vjsElements = document.querySelectorAll('.video-js')

    log(`📊 DOM Check:`)
    log(`  - video elements: ${videoElements.length}`)
    log(`  - [data-vjs-player] divs: ${vjsPlayerDivs.length}`)
    log(`  - .video-js elements: ${vjsElements.length}`)
    log(`  - videoRef.current: ${videoRef.current ? 'EXISTS' : 'NULL'}`)
    log(`  - playerRef.current: ${playerRef.current ? 'EXISTS' : 'NULL'}`)
  }

  useEffect(() => {
    // Check DOM after mount
    setTimeout(() => {
      checkDOMElements()
    }, 1000)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Video.js Test Page (Isolated)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={loadTestStream} disabled={!isPlayerReady}>
              Load Test Stream
            </Button>
            <Button onClick={checkDOMElements} variant="outline">
              Check DOM
            </Button>
            <Button
              onClick={() => setTestResults([])}
              variant="outline"
            >
              Clear Log
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-mono">
              Player Ready: {isPlayerReady ? '✅' : '⏳'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* VIDEO PLAYER - Simple, unconditional rendering */}
      <Card>
        <CardHeader>
          <CardTitle>Video Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <div data-vjs-player suppressHydrationWarning>
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered"
                suppressHydrationWarning
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Log */}
      <Card>
        <CardHeader>
          <CardTitle>Test Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs h-[400px] overflow-auto">
            {testResults.length === 0 ? (
              <p>No logs yet. Click "Check DOM" or "Load Test Stream"</p>
            ) : (
              testResults.map((result, i) => (
                <div key={i}>{result}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
