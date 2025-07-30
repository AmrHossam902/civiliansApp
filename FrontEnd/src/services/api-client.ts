

const fireRequest = (body: Object)=>{

    const accessToken = localStorage.getItem('accessToken');
    let authHeader = accessToken ? 
        `Bearer ${accessToken}` : '';


    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { "Authorization": authHeader } : {})
        },
        cache: 'no-cache',
        body: JSON.stringify(body)
    })
    .then( res => res.json() )
};

function regenerateAccessToken(){
    
    const refreshToken = localStorage.getItem('refreshToken');
    if(!refreshToken)
        return Promise.reject("INVALID_REFRESH_TOKEN");

    const authHeader = `Bearer ${refreshToken}`;

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { "Authorization": authHeader } : {})
        },
        cache: 'no-cache',
        body: JSON.stringify({
            query: `mutation generateNewAccessToken($refreshToken: String!) {
                        generateNewAccessToken(refreshToken: $refreshToken){
                            accessToken
                        }
            }`,
            variables: {
                refreshToken
            }
        })
    })
    .then( res => res.json())
    .then( res => {
        
        if(res.errors)
            return Promise.reject("ACCESS_TOKEN_GENERATION_FAILED");

        localStorage.setItem(
            'accessToken',
            res.data.generateNewAccessToken.accessToken
        );
    })
}

export function sendRequest(body: Object){

    return fireRequest(body)
    .then( (res)=> {
        const tokenExpired = res?.errors?.[0].message == 'Unauthorized'
        if(tokenExpired){
            return regenerateAccessToken()
            .then(()=>{
                //replay request after generating access token
                return fireRequest(body);
            })
        }
        else
            return res;
        
    })

}