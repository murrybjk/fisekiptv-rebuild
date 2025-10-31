import { useCallback, useRef, useEffect } from 'react'

export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const callbackRef = useRef(callback)

  // Keep callback ref up to date (done in effect to avoid ref mutation during render)
  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}
