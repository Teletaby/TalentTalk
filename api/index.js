import express from 'express';
import gTTS from 'gtts';
import { DeepgramClient } from '@deepgram/sdk';
import { Readable } from 'stream';

const app = express();

const deepgram = new DeepgramClient({ apiKey: '06bd4eef302685cc168000965fef50ac50778db1' });

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/**
 * Voice name to language mapping for gTTS
 * Using GTTS for more reliable Node.js TTS
 */
const voiceMap = {
  diana: { lang: 'en', name: 'Diana' },
  autumn: { lang: 'en', name: 'Autumn' },
  hannah: { lang: 'en', name: 'Hannah' },
  austin: { lang: 'en', name: 'Austin' },
  daniel: { lang: 'en', name: 'Daniel' },
  troy: { lang: 'en', name: 'Troy' },
  'aura-asteria-en': { provider: 'deepgram' },
  'aura-2-amalthea-en': { provider: 'deepgram' },
};

// Generate speech using gTTS
app.get('/api/speak', async (req, res) => {
  try {
    const text = req.query.text || 'Hello world';
    const voice = req.query.voice || 'diana';

    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return res.status(400).json({ error: 'Text too long. Maximum 5000 characters.' });
    }

    console.log(`Generating speech for text: ${text.substring(0, 50)}... with voice: ${voice}`);

    const voiceOption = voiceMap[voice];
    if (voiceOption && voiceOption.provider === 'deepgram') {
      const { result, error } = await deepgram.speak.request(
        { text },
        { model: voice }
      );

      if (error) {
        console.error('Deepgram error:', error);
        return res.status(500).json({ error: 'Deepgram TTS generation failed' });
      }

      const stream = result.getStream();
      res.setHeader('Content-Type', 'audio/mpeg');
      stream.pipe(res);
      return;
    }

    // Create gTTS instance
    const gtts = new gTTS({
      text: text,
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Set response headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream the audio to response
    gtts.stream().pipe(res);
  } catch (error) {
    console.error('Error in /speak:', error);
    res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List available voices
app.get('/api/voices', (req, res) => {
  const voices = {
    Female: {
      diana: 'en-US-Diana',
      autumn: 'en-US-Autumn',
      hannah: 'en-US-Hannah',
    },
    Male: {
      austin: 'en-US-Austin',
      daniel: 'en-US-Daniel',
      troy: 'en-US-Troy',
    },
    Deepgram: {
      'aura-asteria-en': 'aura-asteria-en',
      'aura-2-amalthea-en': 'aura-2-amalthea-en',
    }
  };
  res.json(voices);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'TalentTalk Backend API', version: '1.0.0' });
});

export default app;
