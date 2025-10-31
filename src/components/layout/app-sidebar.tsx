"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface Category {
  id: string
  name: string
  count?: number | string
}

interface AppSidebarProps {
  categories: Category[]
  selectedCategoryId: string | null
  onCategorySelect: (id: string) => void
  onRefresh?: () => void
  title?: string
}

export function AppSidebar({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onRefresh,
  title = "CATEGORIES"
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Sidebar collapsible="none" data-testid="app-sidebar" className="flex flex-col h-screen">
      <SidebarHeader className="border-b p-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRefresh}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-2"
        />
      </SidebarHeader>

      <SidebarContent className="flex-1 min-h-0">
        <ScrollArea className="h-full p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredCategories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      isActive={selectedCategoryId === category.id}
                      onClick={() => onCategorySelect(category.id)}
                      className="w-full justify-between"
                    >
                      <span className="truncate">{category.name}</span>
                      {category.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {category.count}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
