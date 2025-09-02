import { ReactNode, createContext, useState } from "react";

type Props = { children: ReactNode}

type UserContextData = {
    name: string,
    roles: string[],
    permissions: string[],
}

export const UserContext = createContext<UserContextData>({
    name: "",
    roles: [],
    permissions: []
});

export function ThemeProvider({children}: Props){

    const [user, setUser] = useState<UserContextData>();

    return <UserContext.Provider value={user!}>
        {children}
    </UserContext.Provider>
}