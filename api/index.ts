/**
 * Vercel Serverless API Handler — Sentinel-X
 *
 * Vercel treats files in the /api directory as serverless functions.
 * This exports the Express app without calling app.listen().
 */
import app from "./artifacts/api-server/src/app.js";

export default app;
