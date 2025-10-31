"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-center">Something went wrong</CardTitle>
              <CardDescription className="text-center">
                An error occurred while loading this content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
