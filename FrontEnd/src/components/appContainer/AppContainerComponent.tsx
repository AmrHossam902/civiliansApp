"use client";
import { ThemeContext } from "@/providers/themeProvider"
import { ReactNode, useContext } from "react"


type Props = {
    children: ReactNode
}

export function AppContainerComponent({children}: Props){
    
    const { theme } = useContext(ThemeContext);

    return <div data-theme={theme} className="bg-primary-lighter">
        {children}
    </div>
}