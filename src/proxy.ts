import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── Routing proxy ───────────────────────────────────────────────
// 1. /admin/* : refresh the Supabase session and send signed-out visitors to
//    the login page (optimistic check only — every page and action verifies
//    the admin on the server too). Admin responses are never indexed.
// 2. Everything else: Arabic is the default locale, matching the original
//    page. `/` and paths without a locale prefix redirect under /ar.

const LOCALES = ["ar", "en"];
const DEFAULT = "ar";

async function adminProxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isLogin = pathname === "/admin/login";

  let res = NextResponse.next({ request: req });
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) req.cookies.set(name, value);
        res = NextResponse.next({ request: req });
        res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
        for (const { name, value, options } of list) res.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/admin/login";
    to.search = "";
    return NextResponse.redirect(to);
  }

  if (user && isLogin) {
    const to = req.nextUrl.clone();
    to.pathname = "/admin";
    to.search = "";
    return NextResponse.redirect(to);
  }

  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return adminProxy(req);
  }

  const first = pathname.split("/")[1];
  if (LOCALES.includes(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip _next, api, and any file with an extension (images, robots.txt…)
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
