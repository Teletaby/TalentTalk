import asyncio
import edge_tts
from flask import Flask, request, send_file
from flask_cors import CORS
import io
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def generate_speech(text, voice="en-US-AvaNeural"):
    """Generate speech using edge-tts"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        # Use an in-memory buffer to avoid creating temporary files
        audio_data = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.write(chunk["data"])
        audio_data.seek(0)
        return audio_data
    except Exception as e:
        logger.error(f"Error generating speech: {e}")
        raise

@app.route('/speak', methods=['GET'])
def speak():
    """Generate and return speech audio"""
    try:
        text = request.args.get('text', 'Hello world')
        voice = request.args.get('voice', 'en-US-AvaNeural')
        
        if not text:
            return {"error": "Text parameter is required"}, 400
        
        logger.info(f"Generating speech for text: {text[:50]}... with voice: {voice}")
        
        # Execute async function
        audio_stream = asyncio.run(generate_speech(text, voice))
        
        return send_file(
            audio_stream,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="speech.mp3"
        )
    except Exception as e:
        logger.error(f"Error in /speak: {e}")
        return {"error": str(e)}, 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {"status": "ok"}, 200

@app.route('/voices', methods=['GET'])
def list_voices():
    """List available Edge-TTS voices (hardcoded for simplicity)"""
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

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
