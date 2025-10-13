import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/install.ps1") {
    return NextResponse.rewrite(new URL("/install", request.url));
  }
}

export const config = {
  matcher: "/install.ps1",
};
