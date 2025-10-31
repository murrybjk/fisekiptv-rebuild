"use client"

import { useEffect } from "react"
import { useConnectionStore } from "@/store/connection"

/**
 * Auto-reconnect hook
 *
 * Automatically reconnects to the server when the app loads
 * if credentials are stored in localStorage.
 *
 * This maintains the connection state across page refreshes and navigation
 * while keeping the security principle of not persisting isConnected.
 */
export function useAutoReconnect() {
  const { isConnected, isHydrated, serverUrl, macAddress, reconnect } = useConnectionStore()

  useEffect(() => {
    // Only run once on mount
    if (!isHydrated && !isConnected && serverUrl && macAddress) {
      reconnect()
    }
  }, [isHydrated, isConnected, serverUrl, macAddress, reconnect])

  return { isConnected, isHydrated }
}
