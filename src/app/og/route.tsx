import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 800;
  style: "normal";
};

let fontsCache: OgFont[] | null = null;

function loadFonts(): OgFont[] {
  if (!fontsCache) {
    const dir = join(process.cwd(), "src/assets/fonts");
    fontsCache = [
      {
        name: "Sora",
        data: readFileSync(join(dir, "sora-400.woff")),
        weight: 400,
        style: "normal",
      },
      {
        name: "Sora",
        data: readFileSync(join(dir, "sora-600.woff")),
        weight: 600,
        style: "normal",
      },
      {
        name: "Sora",
        data: readFileSync(join(dir, "sora-800.woff")),
        weight: 800,
        style: "normal",
      },
    ];
  }
  return fontsCache;
}

/** Branded Open Graph image — dark canvas, gold accent, Sora type. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (
    searchParams.get("title") ?? "Location de voitures à Biougra & Agadir"
  ).slice(0, 110);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0A0A0A",
          padding: "40px",
          fontFamily: "Sora",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(212, 175, 55, 0.5)",
            borderRadius: "10px",
            padding: "48px 56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "#D4AF37",
                borderRadius: "4px",
              }}
            />
            <div style={{ display: "flex", gap: "12px", fontSize: "36px", fontWeight: 800 }}>
              <span style={{ color: "#FFFFFF" }}>MDA</span>
              <span style={{ color: "#D4AF37" }}>CAR</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#F5F5F5",
              maxWidth: "980px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                color: "#B0B0B0",
                fontSize: "25px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "3px",
                  backgroundColor: "#D4AF37",
                }}
              />
              <span>Location de voitures · Biougra &amp; Agadir · Souss-Massa</span>
            </div>
            <div style={{ display: "flex", color: "#D4AF37", fontSize: "25px", fontWeight: 800 }}>
              06 50 91 11 22
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: loadFonts(),
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate",
      },
    },
  );
}
