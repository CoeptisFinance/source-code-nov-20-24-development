import { Handler } from '@netlify/functions';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import crypto from 'crypto';

const headers = {
  'Access-Control-Allow-Origin': 'https://heroic-syrniki-de45c7.netlify.app',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Constants for WebAuthn
const rpID = 'heroic-syrniki-de45c7.netlify.app';
const origin = `https://${rpID}`;

export const handler: Handler = async (event) => {
  console.log('Function called:', {
    path: event.path,
    method: event.httpMethod,
    origin: event.headers.origin
  });

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Generate authentication options without database dependency
    const challenge = crypto.randomBytes(32).toString('base64url');
    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 20000,
      userVerification: 'preferred',
      challenge
    });

    console.log('Generated options:', {
      rpID,
      challenge: !!challenge,
      timeout: options.timeout
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...options,
        _challenge: challenge
      })
    };
  } catch (error) {
    console.error('Handler error:', {
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};