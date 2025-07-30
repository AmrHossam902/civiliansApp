export function login(accountId: number, password: string){
    
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            cache: 'no-cache',
            body: JSON.stringify({
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
        })
        .then(response => response.json())
}