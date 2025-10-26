# FoodBlog — Backend

This directory contains the Node/Express backend for the FoodBlog project.

## Quick overview
- Server entry: `server.js`
- Routes: `routes/user.js`, `routes/recipe.js`
- Controllers: `controller/user.js`, `controller/recipe.js`
- Models: `models/user.js`, `models/recipe.js`

## Requirements
- Node.js 18+ (recommended)
- npm
- A MongoDB instance (Atlas or self-hosted)

## Environment variables
Create a `.env` file (do not commit) with the following variables:

- MONGODB_URI  — MongoDB connection string (e.g. from Atlas)
- JWT_SECRET   — secret for signing JWT tokens
- PORT         — optional, defaults to 5000

Example `.env`:

MONGODB_URI="mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/foodblog?retryWrites=true&w=majority"
JWT_SECRET="a_strong_jwt_secret"
PORT=5000

## Install and run locally

1. Install dependencies

```powershell
cd backend
npm install
```

2. Start server (development)

```powershell
npm run dev # if available, or
node server.js
```

3. Health / quick test

Open `http://localhost:5000/` or the API endpoints like `GET /api/recipes` depending on your routes.

## npm scripts
Check `backend/package.json` for available scripts. If a `start` script isn't present, ensure one is added: `"start": "node server.js"`.

## Deploy notes
- Recommended: host the backend on Render, Railway, Heroku, Cloud Run, or a VPS.
- Set the environment variables in the provider UI (MONGODB_URI, JWT_SECRET, PORT).
- If using MongoDB Atlas, add the hosting provider IPs or 0.0.0.0/0 to the Atlas IP whitelist (or configure VPC peering).

## CORS
If your frontend is hosted on a different origin (e.g., Vercel), ensure CORS is configured in `server.js` or `middleware/auth.js` to allow requests from your frontend domain.

## Recommended `.gitignore`
Create `backend/.gitignore` with at least:

```
node_modules/
.env
.DS_Store
npm-debug.log
```

If `node_modules` is already in the remote repo, remove it from history locally and push a fix (example commands below).

## Remove node_modules from repo (recommended)
If `node_modules` was accidentally committed and pushed, you can remove it and push the fix:

```powershell
cd backend
# add gitignore first
Add-Content -Path .gitignore -Value "node_modules/`n.env"
git rm -r --cached node_modules
git commit -m "chore: remove node_modules and add .gitignore"
git push origin main
```

(If you prefer a cleaner history you can use the `git filter-branch` or `git filter-repo` approach — but be careful as rewriting history affects remote collaborators.)

## Useful tips
- Use environment variables in providers rather than committing secrets.
- Add a basic health endpoint (`GET /health`) for easy monitoring.
- Configure logs on your host to capture startup errors.

---
If you'd like, I can add the `.gitignore` now and remove `node_modules` from the remote (I can do this safely without rewriting history). Tell me if you want me to proceed with that cleanup.