'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/**
 * ThemeToggle component
 *
 * Provides a button to toggle between light and dark themes.
 * Uses next-themes for theme management and persists user preference.
 *
 * Features:
 * - Visual indication of current theme
 * - Smooth transitions between themes
 * - Keyboard accessible
 * - Prevents hydration mismatch with mounted state
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder to avoid hydration mismatch
    return (
      <button
        className="inline-flex items-center justify-center rounded-md p-2 w-10 h-10"
        aria-label="Toggle theme"
        disabled
      >
        <span className="sr-only">Loading theme toggle</span>
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center justify-center rounded-md p-2
                 text-gray-700 dark:text-gray-200
                 hover:bg-gray-100 dark:hover:bg-gray-800
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-900
                 transition-colors duration-200"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  )
}
