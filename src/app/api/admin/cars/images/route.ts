import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdminAction } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

/**
 * Vercel Blob client-upload endpoint.
 *
 * The browser uploads directly to Blob instead of sending the image through
 * the Vercel Function. This avoids Vercel's 4.5 MB Function request limit
 * and, unlike writing to /public/uploads, gives the images durable storage.
 *
 * Authentication is intentionally performed inside onBeforeGenerateToken:
 * the same route also receives Vercel Blob's upload-completed callback, which
 * is server-to-server and does not carry the admin session cookie.
 */
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
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.info("Car image uploaded to Vercel Blob", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Accès non autorisé." }, { status: 401 });
    }

    console.error("Car image upload failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Impossible d'envoyer les images." },
      { status: 400 },
    );
  }
}
