# Volt AI

A frontend starter for an AI assistant website.

## Run locally

1. Install Node.js.
2. Open this folder in VS Code.
3. Run:
   npm install
   npm run dev
4. Open the local URL shown by Vite.

## Current status

The chat UI works, but responses are demo placeholders. No real AI API is connected yet.

## Recommended next architecture

- Frontend: React + TypeScript + Vite
- Backend: Node/TypeScript API
- AI provider: server-side API integration
- Auth: add after the core chat works
- Database: conversations, users, preferences
- Streaming: server-sent events or equivalent
- Deployment: GitHub + a supported hosting platform

## Important

Never put an AI provider API key directly in frontend/browser code. Keep secrets on the server in environment variables.
