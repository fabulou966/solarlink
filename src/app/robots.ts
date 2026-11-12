import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// /admin is never crawlable: the proxy also sends X-Robots-Tag: noindex on
// every admin response, and the admin layout sets robots: noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
