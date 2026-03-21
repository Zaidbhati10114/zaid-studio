import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/quotes/"],
      },
    ],
    sitemap: "https://zaid-studio.vercel.app/sitemap.xml",
  };
}
