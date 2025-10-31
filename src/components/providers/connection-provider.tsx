"use client"

import { useEffect } from "react"
import { useConnectionStore } from "@/store/connection"

/**
 * Connection Provider
 *
 * Handles automatic reconnection on app mount.
 * This component should be placed at the root level.
 */
export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, isHydrated, serverUrl, macAddress, reconnect } = useConnectionStore()

  useEffect(() => {
    // Auto-reconnect once on mount if we have credentials but are not connected
    if (!isHydrated && !isConnected && serverUrl && macAddress) {
      console.log('🔄 [ConnectionProvider] Initiating auto-reconnect...')
      reconnect()
    }
  }, [isHydrated, isConnected, serverUrl, macAddress, reconnect])

  return <>{children}</>
}
