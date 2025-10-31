"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import { useContentStore } from "@/store/content"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export function SearchBar({ placeholder = "Search content...", onSearch }: SearchBarProps) {
  const { searchQuery, setSearchQuery } = useContentStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }, 300)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setLocalQuery("")
    setSearchQuery("")
    onSearch?.("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localQuery)
    onSearch?.(localQuery)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={localQuery}
          onChange={handleChange}
          className="pl-9 pr-9"
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  )
}
