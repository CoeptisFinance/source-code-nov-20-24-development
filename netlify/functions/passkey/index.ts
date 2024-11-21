import type { Handler } from '@netlify/functions';
import PasskeyService from './PasskeyService';

// Fix the rpID and origin initialization
const rpID = process.env.URL ? 
  new URL(process.env.URL).hostname :
  'heroic-syrniki-de45c7.netlify.app';

const origin = process.env.URL || 
  'https://heroic-syrniki-de45c7.netlify.app';

const passkeyService = new PasskeyService(rpID, origin);

const headers = {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

export const handler: Handler = async (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const path = event.path;
    const body = JSON.parse(event.body || '{}');

    console.log('Handler received request:', { path, body });

    if (path.includes('/register/options')) {
      const { userId, username } = body;
      if (!userId || !username) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId or username' })
        };
      }

      const options = await passkeyService.generateRegistrationOptions(userId, username);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(options)
      };
    }

    if (path.includes('/register/verify')) {
      const { userId, registration } = body;
      if (!userId || !registration) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing userId or registration data' })
        };
      }

      const result = await passkeyService.verifyRegistration(userId, registration);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };

  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
  
};
