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
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(voices),
  };
};
