import { upload } from "@vercel/blob/client";
import type { PutBlobResult } from "@vercel/blob";

/**
 * Thin wrapper around @vercel/blob/client's `upload()`.
 *
 * Added purely for diagnosability: the raw `upload()` promise can, in some
 * failure modes (network/CSP/token issues on the deployment), never settle,
 * which left the upload UI stuck at "0%" with no error and nothing in the
 * console. This wrapper does not change how the upload itself works — same
 * `upload()` call, same options — it only:
 *   1. races it against a timeout so the UI always gets a clear error
 *      instead of hanging forever, and
 *   2. logs the real underlying error to the console before rethrowing,
 *      so the actual cause (401, 500, CSP, etc.) is visible next time
 *      instead of being swallowed into the generic Blob error message.
 */
export async function uploadWithDiagnostics(
  pathname: string,
  file: File,
  options: Parameters<typeof upload>[2],
  label: string,
  timeoutMs = 30_000,
): Promise<PutBlobResult> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `L'envoi a dépassé ${Math.round(timeoutMs / 1000)}s sans réponse. Vérifiez la connexion ou réessayez.`,
        ),
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([upload(pathname, file, options), timeout]);
  } catch (error) {
    console.error(`[${label}] upload failed:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId!);
  }
}
