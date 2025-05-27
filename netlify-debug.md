# Netlify Deployment Debug Guide

## Issue: "Can't resolve './App.vue'" Error

### Root Cause
Netlify is incorrectly detecting this as a Vue.js project instead of React.

### Solutions Applied

#### 1. Updated netlify.toml
- Explicit React build configuration
- Added NODE_ENV and CI environment variables
- Specified npm ci for clean dependency installation

#### 2. Updated package.json
- Added explicit build:netlify script
- Specified production mode for Vite build

#### 3. Added .nvmrc
- Explicit Node.js version specification (18)

#### 4. Updated vite.config.js
- Added explicit file extensions resolution
- Optimized build chunks for better performance

### Deployment Steps

1. **Commit Changes**:
```bash
git add .
git commit -m "Fix Netlify deployment: Configure for React instead of Vue"
git push
```

2. **Netlify Settings**:
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Node version: `18`

3. **Environment Variables** (in Netlify Dashboard):
```
NODE_ENV=production
VITE_DEMO_MODE=true
VITE_WHISPER_SERVICE_URL=
```

### If Issue Persists

1. **Clear Netlify Cache**:
   - Go to Netlify Dashboard
   - Site Settings → Build & Deploy
   - Click "Clear cache and deploy site"

2. **Manual Build Test**:
```bash
npm ci
npm run build
```

3. **Check Build Logs** in Netlify for specific error details

### Expected Result
- Successful React build
- No Vue.js related errors
- Working Surveasy application with demo mode
