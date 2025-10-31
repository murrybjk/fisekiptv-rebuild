"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  message?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingScreen({ message = "Loading...", className, size = "md" }: LoadingScreenProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  )
}
