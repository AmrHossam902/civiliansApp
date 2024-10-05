import { ReactNode, createContext, useState } from "react";

export const  themes = ["themeA", "themeB"];

type Props = { children: ReactNode}

type ThemeContextData = {
    theme: string,
    setTheme: (theme: string)=> void;
}

export const ThemeContext = createContext<ThemeContextData>({
    theme: "",
    setTheme: (theme: string) => {} 
});

export function ThemeProvider({children}: Props){

    const [theme, setTheme] = useState<string>("themeB");

    return <ThemeContext.Provider value={{theme, setTheme}}>
        {children}
    </ThemeContext.Provider>
}