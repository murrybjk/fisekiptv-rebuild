"use client"

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfiniteScrollProps {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number
  children: React.ReactNode
  className?: string
  loader?: React.ReactNode
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
  children,
  className,
  loader
}: InfiniteScrollProps) {
  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    threshold
  })

  return (
    <div className={cn("space-y-4", className)}>
      {children}

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {isLoading && (
            loader || (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading more...</span>
              </div>
            )
          )}
        </div>
      )}

      {!hasMore && children && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No more items to load
        </div>
      )}
    </div>
  )
}
