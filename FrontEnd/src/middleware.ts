import { NextRequest, NextResponse } from "next/server";


export function middleware(request: NextRequest) {
    
    console.log("---- calling middleware ----");
    console.log(request.url);
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/civilians', '/login']
}