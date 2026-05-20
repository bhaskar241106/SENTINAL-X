@echo off
TITLE Sentinel Backend
cd /d "%~dp0"
npm run dev --workspace=@workspace/api-server
