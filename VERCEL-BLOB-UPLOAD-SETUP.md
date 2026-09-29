# MDA CAR — Vercel Blob image upload

This version replaces the old `/public/uploads/cars` runtime filesystem upload with Vercel Blob client uploads.

## One-time setup

1. In the Vercel project, open **Storage**.
2. Create a **Blob** store and connect it to this project.
3. Use **Public** access because vehicle images are public website assets.
4. Enable the store for **Production** and **Preview**. Vercel will provide the Blob authentication environment variable for the project.
5. Locally, run `npm install` after extracting this ZIP so `package-lock.json` is regenerated with `@vercel/blob`.

The upload endpoint is protected by the existing admin session. The browser uploads directly to Blob, which avoids Vercel Function request-size limits and keeps uploaded images persistent across deployments.
