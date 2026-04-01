import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const siteUrl = "https://www.isthisvegan.in";
const staticRoutes = ["/", "/go-vegan", "/about", "/join-us"];

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY for sitemap generation."
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

async function generateSitemap() {
  const PAGE_SIZE = 1000;
  let allSlugs = [];
  let from = 0;

  // Paginate through all rows — Supabase caps single queries at 1000 rows
  while (true) {
    const { data, error } = await supabase
      .from("isthisvegan_db")
      .select("slug")
      .not("slug", "is", null)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch snack slugs: ${error.message}`);
    }

    allSlugs = allSlugs.concat(data ?? []);

    if (!data || data.length < PAGE_SIZE) break; // last page reached
    from += PAGE_SIZE;
  }

  const dynamicRoutes = allSlugs
    .map(({ slug }) => slug)
    .filter(Boolean)
    .map((slug) => `/snack/${slug}`);

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>\n    <loc>${escapeXml(`${siteUrl}${route}`)}</loc>\n  </url>`
  )
  .join("\n")}
</urlset>
`;

  await writeFile(resolve("public", "sitemap.xml"), xml, "utf8");
  console.log(`Sitemap generated with ${allRoutes.length} URLs (${dynamicRoutes.length} products + ${staticRoutes.length} static).`);
}

generateSitemap().catch((error) => {
  console.error(error.message);
  process.exit(1);
});