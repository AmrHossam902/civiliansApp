import { sendRequest } from "./api-client"

export function login(accountId: number, password: string){
    
    return sendRequest({
        query: `query LogIn($login: LoginInput!) {
            login(login: $login) {
                accessToken
                refreshToken  
            }
        }`,
        variables: {
            login: {
                accountId,
                password
            }
        }
    })
}


export function decodeJWT(jwt: string){
    try {
        const jwtContent = JSON.parse(atob(jwt.split(".")[1]));
        const permissions = new Set<string>();

        jwtContent.roles.forEach((role: any)=>{
            role.permissions.forEach((p: string) => permissions.add(p));
        });

        localStorage.setItem("permissions", JSON.stringify(Array.from(permissions)))

    } catch (error) {
        console.error("failed to parse access token", error);
    } 

}