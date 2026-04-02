# TalentTalk Backend - Edge-TTS Server

This Flask backend provides text-to-speech synthesis using Microsoft Edge neural voices via the `edge-tts` library.

## Setup

### 1. Install Python Dependencies

```bash
# Navigate to backend directory
cd backend

# Install required packages
pip install -r requirements.txt
```

### 2. Run the Server

```bash
# Local development
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### GET /speak
Generates speech audio from text.

**Parameters:**
- `text` (required): Text to convert to speech
- `voice` (optional): Voice ID (default: `en-US-AvaNeural`)

**Example:**
```
http://127.0.0.1:5000/speak?text=Hello%20World&voice=en-US-AvaNeural
```

**Response:**
- Returns MP3 audio file

### GET /health
Health check endpoint.

**Response:**
```json
{"status": "ok"}
```

### GET /voices
List all available voices.

**Response:**
```json
{
  "Female": {
    "diana": "en-US-AvaNeural",
    "autumn": "en-US-AmberNeural",
    ...
  },
  "Male": {
    "austin": "en-US-GuyNeural",
    ...
  }
}
```

## Available Voices

### Female Voices
- **Diana** (en-US-AvaNeural) - Professional
- **Autumn** (en-US-AmberNeural) - Warm
- **Hannah** (en-US-AriaNeural) - Friendly
- **Jenny** (en-US-JennyNeural) - Clear

### Male Voices
- **Austin** (en-US-GuyNeural) - Professional
- **Daniel** (en-US-EricNeural) - Calm
- **Troy** (en-US-GraysonNeural) - Energetic
- **Andrew** (en-US-AndrewNeural) - Friendly
- **Brian** (en-US-BrianNeural) - Professional

## Deployment

### Render (Recommended for Python)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && python app.py`
5. Add environment variables if needed
6. Deploy!

_Note: Render provides persistent servers suitable for Python async tasks._

### Local Development with Frontend

Run both servers concurrently:

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will automatically connect to `http://127.0.0.1:5000` for Edge-TTS requests.

## Notes

- Generating speech takes 1-2 seconds
- Audio is generated in-memory (no disk writes)
- CORS is enabled for local development
- For production, ensure proper CORS configuration
