
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // Adjust the path if necessary

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session on the server; Better Auth uses the headers for this.
  const session = await auth.api.getSession({ headers: request.headers });

  // If the user is not logged in and they try to access /todos, redirect to /auth/sign-in.
  if (pathname.startsWith("/todos") && !session?.user) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/auth/sign-in";
    return NextResponse.redirect(signInUrl);
  }

  // If the user is not authenticated, or authenticated but not an admin, redirect them away from /admin.
  if (pathname.startsWith("/admin") && (!session?.user || session.user.role !== "admin")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

// Only run this middleware on /todos and /admin routes.
export const config = {
  runtime: "nodejs",
  matcher: ["/todos/:path*", "/admin/:path*"],
};