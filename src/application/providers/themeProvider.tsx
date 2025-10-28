'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ComponentProps } from 'react'

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

/**
 * Theme Provider component that wraps the application with next-themes functionality.
 * Enables dark mode support with system preference detection.
 *
 * @param children - React children components
 * @param props - ThemeProvider props from next-themes
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
