# Deployment Guide for TalentTalk

## Option 1: Frontend on Vercel + Backend on Render (Recommended)

### Frontend Deployment (Vercel)

1. **Connect GitHub to Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Select `Teletaby/TalentTalk` repository
   - Select `main` branch

2. **Configure Build Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Key: `VITE_GROQ_API_KEY`
   - Value: Your Groq API key

4. **Deploy:**
   - Click "Deploy"
   - Take note of your Vercel URL (e.g., `https://talentalk.vercel.app`)

### Backend Deployment (Render)

1. **Prepare backend for Render:**
   - The `backend/requirements.txt` is already configured
   - No changes needed

2. **Deploy to Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect GitHub, select `Teletaby/TalentTalk` repository
   
3. **Configure Service:**
   - Name: `talentalk-backend`
   - Runtime: `Python 3`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
   - Plan: Free or Starter

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete
   - Note your Render URL (e.g., `https://talentalk-backend.onrender.com`)

### Update Frontend to Use Production Backend

1. **Update `src/lib/tts-provider.ts`:**
   
   Replace the backend URL detection with your Render URL:

   ```typescript
   const backendBaseUrl = process.env.NODE_ENV === 'production'
     ? 'https://talentalk-backend.onrender.com'  // Replace with your Render URL
     : 'http://127.0.0.1:5000';
   ```

2. **Redeploy Frontend:**
   - Push changes to GitHub
   - Vercel will auto-deploy

---

## Option 2: Both on Vercel (Advanced)

This requires using Vercel's serverless functions for the Python backend.

1. **Current setup** in `vercel.json` is minimal
2. The Flask backend is created in the `api/` directory
3. Vercel will automatically handle Python serverless functions

**Note:** Vercel's Python support is still beta and can be unstable for long-running tasks like TTS generation. Use Option 1 (Render) for better reliability.

---

## Local Development

```bash
npm start
```

This starts both frontend and backend on:
- Frontend: http://localhost:5173
- Backend: http://127.0.0.1:5000

---

## Environment Variables

### Frontend (.env)
```
VITE_GROQ_API_KEY=your_groq_api_key
```

### Backend
No `.env` needed - backend reads from frontend environment.

---

## Troubleshooting

### "Edge-TTS backend unavailable"
- Make sure backend is running/deployed
- Check that `VITE_BACKEND_URL` points to correct server
- For Render: Wait 1-2 minutes after deployment (cold start)

### 403 Error from Microsoft
- A known issue with edge-tts library
- Fallback to Groq TTS should trigger automatically
- Ensure `VITE_GROQ_API_KEY` is set

### CORS Errors
- Backend CORS is configured for all origins
- Check browser DevTools Network tab for details
