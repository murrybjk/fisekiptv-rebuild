"use client"

import { useState } from "react"
import { AppHeader } from "@/components/layout/app-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Server, HardDrive, Info, Trash2, RefreshCw } from "lucide-react"
import { useConnectionStore } from "@/store/connection"
import { useContentStore } from "@/store/content"
import { ConnectionDialog } from "@/components/features/connection-dialog"
import { toast } from "sonner"

export default function SettingsPage() {
  const { serverUrl, macAddress, isConnected, accountInfo, disconnect } = useConnectionStore()
  const { resetContent } = useContentStore()
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)

  const handleDisconnect = () => {
    disconnect()
    resetContent()
    toast.success("Disconnected from server")
  }

  const handleClearCache = () => {
    resetContent()
    toast.success("Cache cleared successfully")
  }

  const handleReconnect = () => {
    setShowConnectionDialog(true)
  }

  return (
    <>
      <ConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
      />

      <SidebarProvider>
        <div className="flex h-screen w-full flex-col">
          <AppHeader />

          <main className="flex-1 overflow-auto p-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your IPTV connection and application preferences
                  </p>
                </div>
              </div>

              {/* Connection Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Connection Status
                      </CardTitle>
                      <CardDescription>
                        Current server connection information
                      </CardDescription>
                    </div>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isConnected ? (
                    <>
                      <div className="space-y-2">
                        <Label>Server URL</Label>
                        <Input value={serverUrl} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>MAC Address</Label>
                        <Input value={macAddress} disabled />
                      </div>

                      {accountInfo && (
                        <>
                          <Separator />
                          <div className="grid gap-4 md:grid-cols-2">
                            {accountInfo.phone && (
                              <div className="space-y-2">
                                <Label className="text-muted-foreground">Phone</Label>
                                <p className="text-sm">{accountInfo.phone}</p>
                              </div>
                            )}
                            {accountInfo.max_connections && (
                              <div className="space-y-2">
                                <Label className="text-muted-foreground">Max Connections</Label>
                                <p className="text-sm">{accountInfo.max_connections}</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleReconnect}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Change Server
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDisconnect}
                        >
                          <Server className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        Not connected to any server
                      </p>
                      <Button onClick={handleReconnect}>
                        <Server className="mr-2 h-4 w-4" />
                        Connect to Server
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cache Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Cache Management
                  </CardTitle>
                  <CardDescription>
                    Clear cached data to free up space
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Clear Content Cache</p>
                      <p className="text-sm text-muted-foreground">
                        Remove all cached channels, movies, and series data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleClearCache}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Application Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Application Information
                  </CardTitle>
                  <CardDescription>
                    Details about this application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Version</Label>
                      <p className="text-sm">1.0.0</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Framework</Label>
                      <p className="text-sm">Next.js 16.0.0</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">UI Library</Label>
                      <p className="text-sm">Shadcn UI</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Video Player</Label>
                      <p className="text-sm">Video.js</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">About</Label>
                    <p className="text-sm">
                      FisekIPTV is a modern IPTV player built with Next.js, TypeScript, and Shadcn UI.
                      Rebuilt from the ground up with clean architecture and best practices.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}
