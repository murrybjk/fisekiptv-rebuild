"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { LayoutGrid, List } from "lucide-react"
import { useContentStore } from "@/store/content"
import type { ViewMode } from "@/types"

export function ViewToggle() {
  const { viewMode, setViewMode } = useContentStore()

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(value) => {
        if (value) setViewMode(value as ViewMode)
      }}
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
