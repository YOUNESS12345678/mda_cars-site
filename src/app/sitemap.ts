import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getPublishedCars } from "@/lib/cars";

/** Only real, public, canonical, indexable URLs — never admin, api or 404.
 *  PHASE 7: vehicle routes now come from the published cars in the
 *  database instead of the static lib/vehicles sample, so a car added or
 *  removed from /admin/cars is reflected here too — no admin routes are
 *  added (see the Absolute SEO Protection rule for this phase). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { path: "/", priority: 1.0, changeFrequency: "weekly" },
      { path: "/nos-voitures", priority: 0.9, changeFrequency: "weekly" },
      { path: "/location-voiture-biougra", priority: 0.9, changeFrequency: "monthly" },
      { path: "/location-voiture-agadir", priority: 0.9, changeFrequency: "monthly" },
      { path: "/services", priority: 0.8, changeFrequency: "monthly" },
      { path: "/livraison-voiture-maroc", priority: 0.85, changeFrequency: "monthly" },
      { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
      { path: "/a-propos", priority: 0.6, changeFrequency: "monthly" },
    ] as const
  ).map(({ path, priority, changeFrequency }) => ({
    url: `${site.url}${path}`,
    changeFrequency,
    priority,
  }));

  let cars: Awaited<ReturnType<typeof getPublishedCars>> = [];
  try {
    cars = await getPublishedCars();
  } catch {
    // Keep sitemap.xml valid even during a temporary database outage.
    // Static public URLs remain fully crawlable; vehicle URLs return on the next successful request.
  }
  const vehicleRoutes: MetadataRoute.Sitemap = cars.map((vehicle) => ({
    url: `${site.url}/nos-voitures/${vehicle.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
