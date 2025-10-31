"use client"

import { useRouter } from "next/navigation"
import { Tv } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"

export function AppHeader() {
  const router = useRouter()
  const { isConnected, disconnect } = useConnectionStore()
  const { currentTab, setTab } = useContentStore()

  const handleDisconnect = () => {
    disconnect()
    router.push('/')
  }

  const handleTabChange = (value: string) => {
    // Only set tab for valid content tabs, settings navigation handled separately
    if (value === 'live' || value === 'movies' || value === 'series') {
      setTab(value)
    }

    // Navigate to appropriate page
    switch(value) {
      case 'live':
        router.push('/')
        break
      case 'movies':
        router.push('/movies')
        break
      case 'series':
        router.push('/series')
        break
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6 gap-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight">FisekIPTV</span>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="flex-1 max-w-lg">
          <TabsList className="grid w-full grid-cols-3 h-10">
            <TabsTrigger value="live" className="font-medium">Live TV</TabsTrigger>
            <TabsTrigger value="movies" className="font-medium">Movies</TabsTrigger>
            <TabsTrigger value="series" className="font-medium">Series</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1">Connected</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/settings')}
                className="font-medium"
              >
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="font-medium text-destructive hover:text-destructive"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="px-3 py-1">Disconnected</Badge>
          )}
        </div>
      </div>
    </header>
  )
}
