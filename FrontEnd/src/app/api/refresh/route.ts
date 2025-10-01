import { SendRequestOnServer } from "@/services/server-side/api-client-onServer";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    
    console.log("-------accessing refresh token----------");
    console.log("inside route handler", request);

/*     console.log("basePath", request.nextUrl.basePath);
    console.log("search", request.nextUrl.search);
    console.log("searchParams", request.nextUrl.searchParams);

    return NextResponse.json({
        accessToken: Date.now().toString()
    }, {
        headers: {
            'Set-Cookie': `accessToken=${Date.now().toString()}`
        }
    });
 */

    return refreshAT(
        request.cookies.get('accessToken')?.value as string,
        request.cookies.get('refreshToken')?.value as string
    )
    .then( res => {
        if(res?.errors?.[0].message == "INVALID_REFRESH_TOKEN")
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/login`);
        
        if(request.nextUrl.searchParams.has('redirect')){
            
            const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}${request.nextUrl.searchParams.get('redirect')}`)
            response.cookies.set('accessToken', res.data.generateNewAccessToken.accessToken);
            return response;
        }
        else{
            const response = NextResponse.json({
                accessToken: res.data.generateNewAccessToken.accessToken
            });
            response.cookies.set('accessToken', res.data.generateNewAccessToken.accessToken);
            return response;
        }

    })
}

function refreshAT(AT: string, RT: string){
    
    return SendRequestOnServer({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${AT}`
        },
        cache: 'no-cache',
        body: JSON.stringify({
            query: `mutation generateNewAccessToken($refreshToken: String!) {
                        generateNewAccessToken(refreshToken: $refreshToken){
                            accessToken
                        }
            }`,
            variables: {
                refreshToken: RT
            }
        })
    })
}