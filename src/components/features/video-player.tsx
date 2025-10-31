"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import "@videojs/http-streaming"
import type Player from "video.js/dist/types/player"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Minimize2, Maximize2, PictureInPicture2, StopCircle } from "lucide-react"
import { usePlayerStore } from "@/store/player"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { StreamResolver } from "@/lib/stream-resolver"

interface VideoPlayerProps {
  className?: string
}

export function VideoPlayer({ className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const mpegtsPlayerRef = useRef<any>(null)
  const [isPiP, setIsPiP] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [mpegtsLib, setMpegtsLib] = useState<any>(null)
  const currentPlayerType = useRef<'videojs' | 'mpegts' | null>(null)

  const {
    currentStreamUrl,
    currentTitle,
    currentSubtitle,
    isPlaying,
    isMinimized,
    stop,
    toggleMinimize
  } = usePlayerStore()

  // Set mounted state and dynamically import mpegts (client-side only)
  useEffect(() => {
    setIsMounted(true)

    // Dynamically import mpegts.js only on client-side
    if (typeof window !== 'undefined') {
      import('mpegts.js').then((module) => {
        setMpegtsLib(module.default)
        console.log('✅ [VideoPlayer] mpegts.js loaded dynamically')
      }).catch((error) => {
        console.error('❌ [VideoPlayer] Failed to load mpegts.js:', error)
      })
    }
  }, [])

  // Initialize Video.js player ONCE - never destroy it
  useEffect(() => {
    if (!isMounted || !videoRef.current) return

    console.log('🎥 [VideoPlayer] Initializing Video.js player...')

    // Create player
    const player = videojs(videoRef.current, {
      controls: true,
      fluid: false,  // Disable fluid to use explicit container sizing
      responsive: true,  // Keep responsive for better playback
      aspectRatio: '16:9',  // Set explicit aspect ratio
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true,
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
      controlBar: {
        volumePanel: true,
        fullscreenToggle: true,
        pictureInPictureToggle: false,
      }
    })

    // Error handling
    player.on('error', () => {
      const playerError = player.error()
      console.error('Video.js error:', playerError)

      if (playerError) {
        const errorMessage = playerError.message || 'An error occurred while playing the video'
        toast.error('Playback Error', {
          description: errorMessage
        })
      }
    })

    // Ready event
    player.on('ready', () => {
      console.log('✅ [VideoPlayer] Video.js player is ready')
      setIsPlayerReady(true)
    })

    playerRef.current = player

    // Cleanup ONLY on unmount
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
      setIsPlayerReady(false)
    }
  }, [isMounted])

  // Load stream with Video.js
  const loadVideojsStream = useCallback((url: string, type: string) => {
    if (!playerRef.current) return

    console.log('🎬 [VideoPlayer] Loading stream with Video.js:', type)

    // Cleanup mpegts if it was active
    if (mpegtsPlayerRef.current) {
      try {
        console.log('🛑 [VideoPlayer] Cleaning up mpegts player')
        mpegtsPlayerRef.current.pause()
        mpegtsPlayerRef.current.unload()
        mpegtsPlayerRef.current.detachMediaElement()
        mpegtsPlayerRef.current.destroy()
        mpegtsPlayerRef.current = null
      } catch (error) {
        console.error('Error cleaning up mpegts player:', error)
      }
    }

    const player = playerRef.current
    if (!player) return

    // Reset and load new source
    player.pause()
    player.reset()
    player.src({ src: url, type })
    player.load()

    // Wait for canplay before playing
    const playWhenReady = () => {
      const currentPlayer = playerRef.current
      if (!currentPlayer) return
      // @ts-expect-error - TypeScript doesn't narrow types correctly in closures
      currentPlayer.play().catch((error: Error) => {
        console.error('Play error:', error)
        if (error.name === 'NotAllowedError') {
          toast.warning('Autoplay blocked', {
            description: 'Please click play to start streaming'
          })
        }
      })
    }

    player.one('canplay', playWhenReady)

    currentPlayerType.current = 'videojs'
    console.log('✅ [VideoPlayer] Video.js stream loaded')
  }, [])

  // Cleanup mpegts player helper
  const cleanupMpegtsPlayer = useCallback(() => {
    if (mpegtsPlayerRef.current) {
      try {
        console.log('🛑 [VideoPlayer] Cleaning up mpegts player')
        mpegtsPlayerRef.current.pause()
        mpegtsPlayerRef.current.unload()
        mpegtsPlayerRef.current.detachMediaElement()
        mpegtsPlayerRef.current.destroy()
        mpegtsPlayerRef.current = null
      } catch (error) {
        console.error('Error cleaning up mpegts player:', error)
      }
    }
  }, [])

  // Load stream with mpegts.js (reuse player when possible)
  const loadMpegtsStream = useCallback(async (url: string) => {
    if (!videoRef.current || !mpegtsLib) return

    console.log('🎬 [VideoPlayer] Loading TS stream with mpegts.js')

    try {
      // If we have an existing mpegts player, destroy it first
      cleanupMpegtsPlayer()

      // Get video element from Video.js (matching old implementation)
      const videoElement = playerRef.current?.el().querySelector('video') as HTMLVideoElement

      if (!videoElement) {
        throw new Error('Video element not found')
      }

      // Proxy the URL through our API to avoid CORS issues
      const proxiedUrl = `/api/ts-proxy?u=${encodeURIComponent(url)}`
      console.log('📡 [VideoPlayer] Using proxied URL:', proxiedUrl.substring(0, 50) + '...')

      // Create new mpegts player with proxied URL
      mpegtsPlayerRef.current = mpegtsLib.createPlayer({
        type: 'mse',
        isLive: true,
        url: proxiedUrl,
        // Add configuration to handle codec issues
        config: {
          enableWorker: false,
          enableStashBuffer: false,
          stashInitialSize: 128,
          liveBufferLatencyChasing: true,
          liveBufferLatencyChasingOnPaused: false
        }
      })

      // Event listeners
      mpegtsPlayerRef.current.on(mpegtsLib.Events.ERROR, (errorType: any, errorDetail: any, errorInfo: any) => {
        console.error('❌ mpegts.js error:', errorType, errorDetail, errorInfo)

        // Check if it's a codec/MSE error
        const isCodecError = errorInfo?.msg?.includes('addSourceBuffer') ||
                           errorInfo?.msg?.includes('codecs') ||
                           errorInfo?.msg?.includes('unsupported')

        if (isCodecError) {
          console.log('🔄 [VideoPlayer] Codec unsupported in MSE, using Video.js native playback...')
          toast.info('Using alternative playback method...')

          // Use Video.js with the proxied URL as direct stream
          // Video.js will handle it natively without MSE
          loadVideojsStream(proxiedUrl, 'video/mp2t')
        } else {
          console.log('🔄 [VideoPlayer] mpegts.js failed, trying Video.js fallback...')
          toast.error('Stream Error', {
            description: 'Trying alternative player...'
          })

          // Try original URL with Video.js HLS support
          loadVideojsStream(url, 'application/x-mpegURL')
        }
      })

      mpegtsPlayerRef.current.on(mpegtsLib.Events.MEDIA_INFO, (mediaInfo: any) => {
        console.log('📊 mpegts.js media info:', mediaInfo)
      })

      // Attach and load
      mpegtsPlayerRef.current.attachMediaElement(videoElement)
      mpegtsPlayerRef.current.load()

      // Wait for canplay before playing
      const playWhenReady = () => {
        if (videoElement && document.contains(videoElement) && mpegtsPlayerRef.current) {
          const playPromise = mpegtsPlayerRef.current.play()
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((err: Error) => {
              console.error('Play error:', err)
            })
          }
        }
        videoElement.removeEventListener('canplay', playWhenReady)
      }

      videoElement.addEventListener('canplay', playWhenReady, { once: true })

      currentPlayerType.current = 'mpegts'
      console.log('✅ [VideoPlayer] mpegts.js player loaded')

    } catch (error) {
      console.error('❌ [VideoPlayer] mpegts.js failed:', error)
      // Fallback to Video.js
      loadVideojsStream(url, 'application/x-mpegURL')
    }
  }, [mpegtsLib, cleanupMpegtsPlayer, loadVideojsStream])

  // Handle stream changes
  useEffect(() => {
    if (!playerRef.current || !currentStreamUrl || !isPlayerReady) {
      return
    }

    const loadStream = async () => {
      try {
        // Step 1: Resolve URL (server-side now!)
        console.log('🔄 [VideoPlayer] Resolving URL...')
        const resolvedUrl = await StreamResolver.resolveStreamUrl(currentStreamUrl)
        console.log('✅ [VideoPlayer] Resolved URL:', resolvedUrl.substring(0, 80) + '...')

        // Step 2: Detect stream type
        const isHLS = resolvedUrl.includes('.m3u8')
        const isMKV = resolvedUrl.includes('.mkv')
        const isMP4 = resolvedUrl.includes('.mp4') || resolvedUrl.includes('.mpg')

        // TS Live Stream detection:
        // - Contains /live/ (indicates live streaming)
        // - OR has .ts extension
        // - BUT NOT VOD content paths
        const hasLivePath = resolvedUrl.includes('/live/')
        const hasTSExtension = resolvedUrl.includes('.ts')
        const isVODPath = resolvedUrl.includes('/media/') || resolvedUrl.includes('/vod/')
        const isTSLiveStream = (hasLivePath || hasTSExtension) && !isVODPath && !isHLS

        // VOD content (movies/series) vs Live TV
        const isVODContent = isMP4 || isMKV || isVODPath

        console.log('📊 [VideoPlayer] Stream type:', {
          isHLS,
          isMP4,
          isMKV,
          isTSLiveStream,
          isVODContent,
          hasLivePath,
          hasTSExtension,
          isVODPath,
          url: resolvedUrl.substring(0, 100)
        })

        // Step 3: Load with appropriate player
        if (isTSLiveStream && mpegtsLib && typeof mpegtsLib.createPlayer === 'function') {
          // Live TV with TS streams
          await loadMpegtsStream(resolvedUrl)
        } else if (isHLS) {
          // HLS streams (live or VOD)
          loadVideojsStream(resolvedUrl, 'application/x-mpegURL')
        } else if (isMKV) {
          // MKV video files
          loadVideojsStream(resolvedUrl, 'video/x-matroska')
        } else {
          // MP4 and other video files (default)
          loadVideojsStream(resolvedUrl, 'video/mp4')
        }
      } catch (error) {
        console.error('❌ [VideoPlayer] Stream loading error:', error)
        toast.error('Stream Error', {
          description: 'Failed to load stream. Please try another channel.'
        })
      }
    }

    loadStream()
  }, [currentStreamUrl, isPlayerReady, loadMpegtsStream, loadVideojsStream])

  // Handle PiP events
  useEffect(() => {
    const handlePiP = () => setIsPiP(true)
    const handleLeavePiP = () => setIsPiP(false)

    document.addEventListener('enterpictureinpicture', handlePiP)
    document.addEventListener('leavepictureinpicture', handleLeavePiP)

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiP)
      document.removeEventListener('leavepictureinpicture', handleLeavePiP)
    }
  }, [])

  const handleCopyLink = () => {
    if (!currentStreamUrl) {
      toast.warning('No stream URL available')
      return
    }

    navigator.clipboard.writeText(currentStreamUrl)
      .then(() => {
        toast.success('Stream URL copied to clipboard!')
      })
      .catch(() => {
        toast.error('Failed to copy URL')
      })
  }

  const handlePiP = async () => {
    if (!videoRef.current) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await videoRef.current.requestPictureInPicture()
      }
    } catch (error) {
      console.error('PiP error:', error)
      toast.error('Picture-in-Picture not supported')
    }
  }

  const handleStop = () => {
    // Cleanup mpegts player
    cleanupMpegtsPlayer()

    // Stop Video.js player
    if (playerRef.current) {
      playerRef.current.pause()
      playerRef.current.reset()
    }

    stop()
    toast.info('Playback stopped')
  }

  const showPlaceholder = !isPlaying && !currentStreamUrl

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isPlaying ? "h-full" : "h-[80px]",
      className
    )} data-testid="video-player">
      <CardContent className="p-0 h-full">
        {/* Video Player - ALWAYS MOUNTED (never conditional) */}
        <div className={cn(
          "relative bg-black rounded-lg overflow-hidden h-full w-full",
          showPlaceholder && "!h-[60px]"
        )}>
          {isMounted && (
            <div
              data-vjs-player
              suppressHydrationWarning
              className={cn(
                "vjs-container",
                showPlaceholder && "hidden"
              )}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Video element is ALWAYS rendered - never unmounted */}
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered"
                suppressHydrationWarning
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}

          {/* Placeholder - Absolute positioned overlay (doesn't affect video element) */}
          {showPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-4 py-2 bg-background z-10 pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted p-2">
                  <StopCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold">{currentTitle || "No stream selected"}</h3>
                  {currentSubtitle && (
                    <p className="text-xs text-muted-foreground">{currentSubtitle}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading state before mount */}
          {!isMounted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading player...</div>
            </div>
          )}
        </div>

        {/* Controls Bar - Only show when playing */}
        {!showPlaceholder && (
          <div className="bg-muted/30 backdrop-blur-sm border-t p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold truncate">{currentTitle}</h4>
                {currentSubtitle && (
                  <p className="text-xs text-muted-foreground truncate">{currentSubtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  title="Copy stream URL"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMinimize}
                  title={isMinimized ? "Restore" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePiP}
                  title="Picture in Picture"
                  disabled={isPiP}
                >
                  <PictureInPicture2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStop}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
