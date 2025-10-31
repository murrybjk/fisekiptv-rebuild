"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * TEST PAGE: Simulates connected state and redirects to home
 *
 * This bypasses the connection flow by pre-populating localStorage
 * with mock IPTV connection data, then redirects to the main page.
 */
export default function TestLiveTVPage() {
  const router = useRouter()

  useEffect(() => {
    console.log('🧪 [TEST] Setting up mock IPTV connection...')

    // Mock connection data
    const mockConnectionData = {
      serverUrl: 'http://test-server.local',
      macAddress: '00:1A:79:00:00:01',
      isConnected: true,
      accountInfo: {
        mac: '00:1A:79:00:00:01',
        status: 'active',
        expDate: '2025-12-31'
      }
    }

    // Mock channels data (simplified)
    const mockChannels = [
      {
        id: '1',
        name: 'Test Channel 1',
        number: 1,
        logo: '',
        cmd: 'http://test-server.local/ch/1',
        category_id: '1'
      },
      {
        id: '2',
        name: 'Test Channel 2',
        number: 2,
        logo: '',
        cmd: 'http://test-server.local/ch/2',
        category_id: '1'
      }
    ]

    const mockCategories = [
      { id: '1', name: 'All Channels', count: 2 }
    ]

    // Populate localStorage with mock data
    const connectionStore = {
      state: {
        serverUrl: mockConnectionData.serverUrl,
        macAddress: mockConnectionData.macAddress,
        isConnected: mockConnectionData.isConnected,
        accountInfo: mockConnectionData.accountInfo
      },
      version: 0
    }

    const contentStore = {
      state: {
        currentTab: 'live',
        categories: mockCategories,
        channels: mockChannels,
        movies: [],
        series: [],
        selectedCategoryId: null,
        searchQuery: '',
        isLoading: false,
        viewMode: 'grid'
      },
      version: 0
    }

    localStorage.setItem('connection-storage', JSON.stringify(connectionStore))
    localStorage.setItem('content-storage', JSON.stringify(contentStore))

    console.log('✅ [TEST] Mock data set in localStorage')
    console.log('🔄 [TEST] Redirecting to main page...')

    // Small delay to ensure localStorage is written
    setTimeout(() => {
      router.push('/')
    }, 500)
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg">Setting up test environment...</p>
        <p className="text-sm text-muted-foreground">Redirecting to Live TV page</p>
      </div>
    </div>
  )
}
