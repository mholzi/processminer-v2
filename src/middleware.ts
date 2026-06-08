import { NextResponse, type NextRequest } from "next/server";
import { isForbiddenCrossOrigin } from "@/lib/csrf";

// CSRF defense-in-depth (API-10): reject cross-origin state-changing requests
// to the API before they reach a route handler. Pairs with the sameSite=strict
// session cookie. Safe methods and same-origin/no-Origin requests pass through.
export function middleware(req: NextRequest) {
  if (
    isForbiddenCrossOrigin(
      req.method,
      req.headers.get("origin"),
      req.headers.get("host"),
      process.env.PM_ALLOWED_ORIGIN,
    )
  ) {
    return NextResponse.json(
      { error: "Cross-origin request blocked." },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
