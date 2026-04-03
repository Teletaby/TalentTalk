// Deepgram voice model mapping
const voiceMap = {
  diana: 'aura-2-amalthea-en',    // Female - professional
  autumn: 'aura-2-amber-en',      // Female - warm
  hannah: 'aura-2-aria-en',       // Female - friendly
  austin: 'aura-2-austin-en',     // Male - professional
  daniel: 'aura-2-daniel-en',     // Male - calm
  troy: 'aura-2-troy-en',         // Male - energetic
};

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Deepgram API key not configured' }),
      };
    }

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

    const deepgramModel = voiceMap[voice] || voiceMap.diana;
    console.log(`Generating Deepgram speech with model: ${deepgramModel}`);

    // Call Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/speak?model=' + deepgramModel + '&speed=1', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Deepgram API error (${response.status}):`, errorData);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Deepgram API error: ${response.statusText}` }),
      };
    }

    // Convert response to buffer
    const buffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error in /speak:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message || 'TTS generation failed' }),
    };
  }
};
