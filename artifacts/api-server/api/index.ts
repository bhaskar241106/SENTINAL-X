/**
 * Vercel Serverless API Handler — Sentinel-X
 *
 * This handler is placed in artifacts/api-server/api/index.ts to match the
 * Vercel Root Directory configuration. It imports the Express app from src/app
 * and exports it for serverless injection.
 */
import app from "../src/app";

export default app;
