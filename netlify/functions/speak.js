import gTTS from 'gtts';

const voiceMap = {
  diana: { lang: 'en', name: 'Diana' },
  autumn: { lang: 'en', name: 'Autumn' },
  hannah: { lang: 'en', name: 'Hannah' },
  austin: { lang: 'en', name: 'Austin' },
  daniel: { lang: 'en', name: 'Daniel' },
  troy: { lang: 'en', name: 'Troy' },
};

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const text = queryParams.text || 'Hello world';
    const voice = queryParams.voice || 'diana';

    if (!text || text.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Text parameter is required' }),
      };
    }

    // Limit text length to prevent abuse
    if (text.length > 5000) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Text too long. Maximum 5000 characters.' }),
      };
    }

    console.log(`Generating speech for text: ${text.substring(0, 50)}... with voice: ${voice}`);

    // Create gTTS instance
    const gtts = new gTTS({
      text: text,
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Convert stream to buffer
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      gtts.stream()
        .on('data', chunk => chunks.push(chunk))
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          const base64Audio = buffer.toString('base64');
          
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*',
            },
            body: base64Audio,
            isBase64Encoded: true,
          });
        })
        .on('error', err => {
          reject(err);
        });
    });
  } catch (error) {
    console.error('Error in /speak:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message || 'TTS generation failed' }),
    };
  }
};
