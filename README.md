# Sentinel-X Road Intelligence

Sentinel-X is a BIMSTEC-focused road intelligence platform combining an Express API backend with a React + Vite frontend.

The project delivers legal guidance, traffic challan information, emergency assistance, geofencing, AI risk analysis, and a chat-based interface for users across BIMSTEC countries.

## Architecture

- **Frontend**: `artifacts/drivelegal` (React, Vite, PWA support)
- **Backend**: `artifacts/api-server` (Express, rate limiting, API gateway)
- **Shared libraries**: `lib/*`
- **Monorepo tooling**: npm workspaces

## Key Features

- Country law lookup and comparison
- Traffic challan / fine information
- Emergency response guidance
- Sentinel risk analysis via AI integrations
- Chat and voice assistant UI
- Geofence / police mode pages
- Offline detection and resilient client behavior

## Local Development

1. Open a terminal at the workspace root:
   ```powershell
   cd "C:\Users\bhaskar\Downloads\Drive-Legal-BIMstec\Drive-Legal-BIMstec"
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the backend:
   ```powershell
   npm --workspace=@workspace/api-server run dev
   ```
4. Start the frontend:
   ```powershell
   npm --workspace=@workspace/drivelegal run dev
   ```
5. Open the frontend in your browser:
   ```text
   http://localhost:5173/
   ```

## Environment Configuration

- Backend environment file: `artifacts/api-server/.env`
- Default backend port: `3001`
- Frontend API proxy target: `http://127.0.0.1:3001`

### Important

The frontend is configured to proxy `/api` requests to the backend. If you change the backend port, also update the frontend proxy target or the `API_SERVER_URL` environment variable.

## Useful Package Scripts

- `npm --workspace=@workspace/api-server run dev` — Run backend in development mode
- `npm --workspace=@workspace/drivelegal run dev` — Run frontend in development mode
- `npm --workspace=@workspace/api-server run typecheck` — Typecheck backend
- `npm --workspace=@workspace/drivelegal run typecheck` — Typecheck frontend

## Notes

- `artifacts/api-server/src/app.ts` sets up universal rate limiting and `/api` routing.
- `artifacts/drivelegal/vite.config.ts` enables PWA support and local API proxying.
- If you run into port conflicts, adjust `PORT` in `artifacts/api-server/.env` and `API_SERVER_URL` in the frontend environment or Vite config.
