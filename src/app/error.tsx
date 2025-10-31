"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-center">Application Error</CardTitle>
          <CardDescription className="text-center">
            Something went wrong with the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground font-mono">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
