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
      diana: 'aura-2-amalthea-en',
      autumn: 'aura-2-amber-en',
      hannah: 'aura-2-aria-en',
    },
    Male: {
      austin: 'aura-2-austin-en',
      daniel: 'aura-2-daniel-en',
      troy: 'aura-2-troy-en',
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
