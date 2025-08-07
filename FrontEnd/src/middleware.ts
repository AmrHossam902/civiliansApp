import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    
    console.log("---- calling middleware ----");
    console.log(request.url);
    console.log(" path name ", request.nextUrl.pathname);

    console.log("---validate tokens ---");
    const accessToken = request.cookies.get("accessToken");
    const refreshToken = request.cookies.get("refreshToken");
    console.log("accessToken", accessToken);

    if(!accessToken || !refreshToken)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/login`);

    try {
        let accessTokenPayload = await jwtVerify(
            accessToken.value, 
            new TextEncoder().encode(process.env.JWT_SECRET) 
        );
        return NextResponse.next();
    } catch (error) {
        console.error("fuckin' error", error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/api/refresh?redirect=${request.nextUrl.pathname}`);   
    }
}


function setMyFuckinCookie(){
    cookies().set("shitCookie", Date.now().toString());
}

export const config = {
    matcher: ['/civilians/:path*']
}