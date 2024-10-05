'use client';

import { NextUIProvider } from "@nextui-org/react"
import { ReactNode } from "react"
import { ThemeProvider } from "./themeProvider"


type Props = {
    children: ReactNode
}


export function ProvidersContainer({children}: Props){
    return (
        <NextUIProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </NextUIProvider>
    )
}