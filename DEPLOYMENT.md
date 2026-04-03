# TalentTalk Deployment Guide

## Netlify Deployment (Recommended)

Both frontend and backend run on **Netlify** with zero external dependencies.

### Step 1: Deploy to Netlify

1. **Via Netlify Dashboard:**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select GitHub and authorize Netlify
   - Choose `Teletaby/TalentTalk` repository
   - Select `main` branch

2. **Or via Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   ```

### Step 2: Automatic Configuration

Netlify automatically detects the `netlify.toml` configuration which includes:
- **Build Command:** `npm run build`
- **Functions Directory:** `netlify/functions`
- **Publish Directory:** `dist`
- **API Routes:** Rewritten to serverless functions at `/.netlify/functions/*`

### Step 3: Add Environment Variables

In Netlify site settings (Site settings → Build & deploy → Environment), add:

| Key | Value |
|-----|-------|
| `VITE_GROQ_API_KEY` | Your Groq API key from https://console.groq.com |

Click "Save" and trigger a new deploy.

### Step 4: Deploy

- If using the dashboard: Click **"Deploy site"**
- If using CLI: Run `netlify deploy --prod`
- Wait ~2-3 minutes for build to complete
- Your app is now live at `https://<your-netlify-site>.netlify.app`

### Step 5: Done! ✅

Both frontend and backend are deployed:
- **Frontend:** `/` (Vite React app)
- **Backend API:** `/api/*` (Netlify serverless functions)

---

## How It Works

**Architecture:**
```
https://your-site.netlify.app/
├── / → React frontend (Vite)
├── /api/speak → Netlify Function - Google TTS
├── /api/health → Netlify Function - Health check
└── /api/voices → Netlify Function - Available voices
```

**Netlify Functions:**
- `/api/speak` - Converts text to speech using Google TTS (gTTS)
- `/api/health` - Returns server health status
- `/api/voices` - Lists available voices for TTS

**Local Development:**
```bash
npm start
```
Starts both on:
- Frontend: http://localhost:5173 (Vite)
- Backend: http://127.0.0.1:5000 (Express.js)

Both start automatically with `concurrently`.

---

## Environment Variables

### Required

| Variable | Where to Add | Value |
|----------|-------------|-------|
| `VITE_GROQ_API_KEY` | Vercel Settings | Your Groq API key |

### Optional

To change the default TTS provider, modify `src/pages/Index.tsx`:
```typescript
const [ttsProvider, setTtsProvider] = useState<"groq" | "web-speech" | "gtts" | "edge-tts">("web-speech");
```
Deployment fails with "npm install" errors
- Ensure `package.json` includes all dependencies
- Check Netlify build logs: Site settings → Deploys → Click failed deploy
- Try clearing the cache: Site settings → Deploys → "Clear cache and retry"

### TTS Generation Fails
- Check Netlify Function logs: Functions tab in Netlify dashboard
- Verify `VITE_GROQ_API_KEY` is set in environment variables if using Groq provider
- Try switching to "Web Speech API" (browser native, always works)

### API Routes Not Working
- Verify the `netlify.toml` file exists and is properly formatted
- Check that Netlify functions are deployed: Deploys → Functions tab
- Netlify Functions have a 10-second timeout on free tier, 26 seconds on Pro
- Monitor function execution time in Netlify Analytics

### Build Fails
- Check the build logs for dependency issues
- Ensure `netlify/functions` directory exists with `.js` files
- Run `npm run build` locally to verify the build works
- Verify `VITE_GROQ_API_KEY` is set if using Groq provider
- Try switching to "Web Speech API" (browser native, always works)

### Serverless Function Timeout
- Vercel has a 60-second timeout for free tier
- Most TTS requests complete in 1-2 seconds
- If timeout occurs, upgrade to Pro plan

### CORS Errors
- Backend CORS is configured for all origins
- Check browser DevTools Console for detailed error messages

---

## Comparing Deployment Options

### Vercel Solo (Recommended) ✅
- **Cost:** Free tier available
- **Setup:** 3 minutes
- **Scalability:** Serverless auto-scaling
- **Pros:** Simple, fast, no credit card required
- **Cons:** 60s timeout on free tier, cold starts 1-2s

### Vercel + Render
- **Cost:** Free tier (both)
- **Setup:** 15 minutes
- **Scalability:** Manual configuration
- **Pros:** Better control, longer timeouts
- **Cons:** More complex setup, cross-service debugging

---

## Updating the App

After deployment, to update your app:

1. **Make changes** locally and test with `npm start`
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Vercel auto-deploys** from `main` branch

---

## Custom Domain

To use a custom domain:

1. In Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

---

## API Endpoints

All endpoints available at `https://your-app.vercel.app/api/...`

### Generate Speech
```
GET /api/speak?text=Hello&voice=en-US-AvaNeural
Returns: audio/mpeg (MP3 file)
```

### Available Voices
```
GET /api/voices
Returns: JSON with available voices
```

### Health Check
```
GET /api/health
Returns: {"status": "ok"}
```

---

## Performance Notes

- TTS generation: 1-2 seconds per request
- Vercel cold start: 1-2 seconds (first request after inactivity)
- Caching: Audio responses are cached in browser for 1 hour
- Rate limiting: No artificial limits

---

## Support

For issues:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting
2. Review browser DevTools Console
3. Check Vercel deployment logs: https://vercel.com/dashboard

