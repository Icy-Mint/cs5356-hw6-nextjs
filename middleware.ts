
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // adjust path if your auth.ts is elsewhere

export async function middleware(request: NextRequest) {
    /* Implement a redirecting middleware YOUR CODE HERE */
    const pathname = request.nextUrl.pathname;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

  // Redirect if not logged in and accessing /todos
    if (pathname === "/todos" && !session) {
        return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }

  // Redirect if not logged in OR not admin, accessing /admin
    if (pathname === "/admin" && (!session || session.user?.role !== "admin")) {
        return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: [/* TODO: Add paths to match */]
}
