"use client"

import * as React from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
    return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}