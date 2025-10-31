"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tv, Loader2 } from "lucide-react"
import { useConnectionStore } from "@/store/connection"
import { IPTVClient } from "@/lib/api/client"
import { toast } from "sonner"

const connectionSchema = z.object({
  serverUrl: z
    .string()
    .min(1, "Server URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must start with http:// or https://"
    ),
  macAddress: z
    .string()
    .min(1, "MAC Address is required")
    .regex(
      /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
      "Please enter a valid MAC address (e.g., 00:1A:79:XX:XX:XX)"
    ),
})

type ConnectionFormValues = z.infer<typeof connectionSchema>

interface ConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConnectionDialog({ open, onOpenChange }: ConnectionDialogProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { serverUrl, macAddress, setConnection } = useConnectionStore()

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      serverUrl: serverUrl || "http://",
      macAddress: macAddress || "",
    },
  })

  const onSubmit = async (values: ConnectionFormValues) => {
    setIsConnecting(true)

    try {
      // Create API client
      const client = new IPTVClient(values.serverUrl, values.macAddress)

      // Test connection by fetching account info
      toast.info("Connecting to server...")
      const accountInfo = await client.fetchAccountInfo()

      // Save connection
      setConnection(values.serverUrl, values.macAddress, accountInfo)

      toast.success("Successfully connected!", {
        description: `Connected to ${values.serverUrl}`,
      })

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error("Connection error:", error)
      toast.error("Connection failed", {
        description: error instanceof Error ? error.message : "Unable to connect to server",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Tv className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Connect to IPTV Server</DialogTitle>
          <DialogDescription className="text-center">
            Enter your server credentials to start streaming
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pointer-events-auto">
            <FormField
              control={form.control}
              name="serverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Server URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://example.com"
                      {...field}
                      disabled={isConnecting}
                    />
                  </FormControl>
                  <FormDescription className="pointer-events-none">
                    The URL of your IPTV server
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="macAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MAC Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00:1A:79:XX:XX:XX"
                      {...field}
                      disabled={isConnecting}
                    />
                  </FormControl>
                  <FormDescription className="pointer-events-none">
                    Your device MAC address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isConnecting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Server"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
