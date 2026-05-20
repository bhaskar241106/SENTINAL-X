/**
 * Vercel Serverless API Handler — Sentinel-X
 *
 * Vercel automatically treats files inside the /api directory as serverless functions.
 * This file re-exports the Express app (compiled by esbuild from src/vercel.ts).
 *
 * The app is exported WITHOUT calling app.listen() — Vercel's runtime handles
 * request injection directly into the Express app instance.
 */
export { default } from "../artifacts/api-server/dist/vercel.mjs";
