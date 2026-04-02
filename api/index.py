import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import edge_tts
from flask import Flask, request, send_file
import io
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_speech(text, voice="en-US-AvaNeural"):
    """Generate speech using edge-tts"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        audio_data = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
        audio_data.seek(0)
        return audio_data
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        raise

@app.route('/api/speak', methods=['GET', 'OPTIONS'])
def speak():
    """Generate and return speech audio"""
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 200

    try:
        text = request.args.get('text', 'Hello world')
        voice = request.args.get('voice', 'en-US-AvaNeural')
        
        if not text:
            return {"error": "Text parameter is required"}, 400
        
        logger.info(f"Generating speech for text: {text[:50]}... with voice: {voice}")
        
        audio_stream = asyncio.run(generate_speech(text, voice))
        
        response = app.make_response(audio_stream.getvalue())
        response.headers['Content-Type'] = 'audio/mpeg'
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        return response, 200
    except Exception as e:
        logger.error(f"Error in /speak: {e}")
        return {"error": str(e)}, 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {"status": "ok"}, 200

@app.route('/api/voices', methods=['GET'])
def list_voices():
    """List available Edge-TTS voices"""
    voices = {
        "Female": {
            "diana": "en-US-AvaNeural",
            "autumn": "en-US-AmberNeural", 
            "hannah": "en-US-AriaNeural",
            "jenny": "en-US-JennyNeural",
        },
        "Male": {
            "austin": "en-US-GuyNeural",
            "daniel": "en-US-EricNeural",
            "troy": "en-US-GraysonNeural",
            "andrew": "en-US-AndrewNeural",
            "brian": "en-US-BrianNeural",
        }
    }
    return voices, 200

# Vercel uses this handler
def handler(req, res):
    return app(req.environ, res.start_response)
