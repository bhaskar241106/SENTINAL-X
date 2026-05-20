/**
 * Vercel-compatible entry point for the Sentinel-X API.
 *
 * This file exports the Express `app` instance WITHOUT calling `app.listen()`.
 * Vercel's serverless runtime injects HTTP requests directly into the app,
 * so we must NOT start a server — just export the app object.
 */
export { default } from "./app.js";
