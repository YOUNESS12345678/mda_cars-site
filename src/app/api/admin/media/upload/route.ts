import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdminAction } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await requireAdminAction();
        const extension = pathname.split(".").pop()?.toLowerCase();
        const allowedExtension = new Set(["jpg", "jpeg", "png", "webp", "avif", "gif"]);
        if (!extension || !allowedExtension.has(extension)) {
          throw new Error("Format d'image non supporté.");
        }
        return {
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.info("Site media uploaded to Vercel Blob", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }
    console.error("Site media upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible d'envoyer l'image." },
      { status: 400 },
    );
  }
}
