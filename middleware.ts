import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  parent: "/parent",
};

export async function middleware(request: NextRequest) {
  const { response, user, role } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isProtected = ["/admin", "/teacher", "/parent"].some((p) =>
    path.startsWith(p)
  );

  // Not logged in and trying to hit a protected area -> send to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", path);
    return NextResponse.redirect(url);
  }

  // Logged in but hitting a section that isn't theirs -> send to their own home
  if (isProtected && user && role) {
    const ownSection = `/${role}`;
    if (!path.startsWith(ownSection)) {
      const url = request.nextUrl.clone();
      url.pathname = ROLE_HOME[role] ?? "/login";
      return NextResponse.redirect(url);
    }
  }

  // Already logged in and visiting /login -> bounce to their dashboard
  if (path === "/login" && user && role) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role] ?? "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)",
  ],
};
