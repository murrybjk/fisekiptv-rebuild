import { usePlayerStore } from "@/store/player"
import { toast } from "sonner"

export function usePlayer() {
  const { setStream, stop, isPlaying } = usePlayerStore()

  const play = (streamUrl: string, title: string, subtitle?: string) => {
    console.log('🎯 [usePlayer] play() called:', {
      streamUrl,
      title,
      subtitle,
      streamUrlLength: streamUrl?.length,
      streamUrlType: typeof streamUrl
    })

    if (!streamUrl) {
      console.error('❌ [usePlayer] No stream URL provided')
      toast.error('No stream URL provided')
      return
    }

    console.log('✅ [usePlayer] Calling setStream...')
    setStream(streamUrl, title, subtitle || '')
    toast.success('Playing', {
      description: title
    })
  }

  const stopPlayback = () => {
    stop()
    toast.info('Playback stopped')
  }

  return {
    play,
    stop: stopPlayback,
    isPlaying
  }
}
