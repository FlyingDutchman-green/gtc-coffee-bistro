import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_URL = "https://www.belanja-gtc-center.my.id";

/**
 * Proxy: Permanently redirect all *.vercel.app traffic to the canonical domain.
 *
 * `middleware` was renamed to `proxy` in Next.js v16.0.0.
 * See: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host.endsWith(".vercel.app")) {
    // Preserve the original path + search so deep links still work after redirect
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      CANONICAL_URL
    );
    return NextResponse.redirect(destination, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run on every path except Next.js internals and static assets.
   * The host check inside proxy() keeps the logic tight.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.svg|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)).*)",
  ],
};
