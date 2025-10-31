import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AccountInfo } from '@/types'

interface ConnectionState {
  serverUrl: string
  macAddress: string
  isConnected: boolean
  accountInfo: AccountInfo | null
  isHydrated: boolean

  setConnection: (url: string, mac: string, accountInfo?: AccountInfo) => void
  disconnect: () => void
  updateAccountInfo: (info: AccountInfo) => void
  setHydrated: () => void
  reconnect: () => Promise<void>
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      serverUrl: '',
      macAddress: '',
      isConnected: false,
      accountInfo: null,
      isHydrated: false,

      setConnection: (url, mac, accountInfo) =>
        set({
          serverUrl: url,
          macAddress: mac,
          isConnected: true,
          accountInfo: accountInfo || null
        }),

      disconnect: () =>
        set({
          isConnected: false,
          accountInfo: null
        }),

      updateAccountInfo: (info) =>
        set({ accountInfo: info }),

      setHydrated: () =>
        set({ isHydrated: true }),

      reconnect: async () => {
        const { serverUrl, macAddress } = get()

        // Only reconnect if we have credentials
        if (serverUrl && macAddress) {
          console.log('🔄 [ConnectionStore] Auto-reconnecting with stored credentials...')
          try {
            const { IPTVClient } = await import('@/lib/api/client')
            const client = new IPTVClient(serverUrl, macAddress)
            const accountInfo = await client.fetchAccountInfo()

            set({
              isConnected: true,
              accountInfo,
              isHydrated: true
            })

            console.log('✅ [ConnectionStore] Auto-reconnect successful')
          } catch (error) {
            console.error('❌ [ConnectionStore] Auto-reconnect failed:', error)
            set({ isHydrated: true }) // Mark as hydrated even if connection fails
          }
        } else {
          set({ isHydrated: true })
        }
      },
    }),
    {
      name: 'fisekiptv-connection',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      }),
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        macAddress: state.macAddress,
        // Don't persist connection status or account info
      })
    }
  )
)
