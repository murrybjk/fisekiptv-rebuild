"use client"

import { LoadingScreen } from "@/components/features/loading-screen"

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingScreen message="Loading application..." size="lg" />
    </div>
  )
}
