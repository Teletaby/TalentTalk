# TalentTalk Deployment Guide

## Vercel Solo Deployment (Easiest)

Both frontend and backend run on **Vercel** with zero external dependencies.

### Step 1: Deploy to Vercel

1. **Go to Vercel:**
   - https://vercel.com
   - Sign in with GitHub

2. **Add New Project:**
   - Click "Add New Project"
   - Search for and select `Teletaby/TalentTalk`
   - Select `main` branch

3. **Configure Project:**
   - **Framework:** Vite
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 2: Add Environment Variables

In Vercel deployment settings, add:

| Key | Value |
|-----|-------|
| `VITE_GROQ_API_KEY` | Your Groq API key from https://console.groq.com |

### Step 3: Deploy

- Click **"Deploy"**
- Wait ~3-5 minutes for build to complete
- Your app is now live at `https://<your-vercel-url>.vercel.app`

### Step 4: Done! ✅

That's it. Both frontend and backend are deployed:
- **Frontend:** `/` (Vite React app)
- **Backend API:** `/api/*` (Python Flask serverless functions)

---

## How It Works

**Architecture:**
```
https://your-app.vercel.app/
├── / → React frontend (Vite)
├── /api/speak → Python Flask (Edge-TTS)
├── /api/health → Health check
└── /api/voices → Available voices
```

**Local Development:**
```bash
npm start
```
Starts both on:
- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:5000

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

---

## Troubleshooting

### "Edge-TTS backend unavailable"
- Check if Vercel deployment succeeded
- Verify `VITE_GROQ_API_KEY` is set in Vercel Project Settings
- Refresh the page

### 403 Error from Edge-TTS
- This happens when Microsoft's service rejects the connection
- The app will automatically fallback to Groq TTS
- Ensure `VITE_GROQ_API_KEY` is valid

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

