/**
 * Vercel Serverless API Handler — Sentinel-X
 *
 * Vercel natively compiles TypeScript files in the /api directory.
 * This handler imports the Express app directly from its TypeScript source —
 * no esbuild pipeline needed. Vercel's runtime handles compilation and injection.
 *
 * NOTE: The Express app must NOT call app.listen() — Vercel injects
 * HTTP requests directly into the exported app instance.
 */
import app from "../artifacts/api-server/src/app";

export default app;
