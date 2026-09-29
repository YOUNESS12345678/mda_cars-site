import { getSeoKeyword } from "@/lib/seo-keywords";

export async function SeoKeyword({ keywordKey, fallback, className = "" }: { keywordKey: string; fallback: string; className?: string }) {
  const row = await getSeoKeyword(keywordKey, fallback);
  const value = row.enabled ? row.keyword : fallback;
  const classes = `${row.enabled && row.bold ? "font-semibold" : "font-normal"} ${className}`.trim();
  return <span className={classes}>{value}</span>;
}
