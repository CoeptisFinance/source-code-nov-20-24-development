import type { Handler } from '@netlify/functions';
import { 
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import * as admin from 'firebase-admin';
import { db } from '../config/firebase-admin';

const rpName = 'CoinConnect';
const rpID = process.env.URL?.replace(/^https?:\/\//, '') || 'localhost';
const origin = process.env.URL || 'http://localhost:8888';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const path = event.path.replace('/.netlify/functions/passkey/', '');
  const body = JSON.parse(event.body || '{}');

  try {
    switch (path) {
      case 'register/options': {
        const { userId, username } = body;
        
        const options = await generateRegistrationOptions({
          rpName,
          rpID,
          userID: userId,
          userName: username,
          attestationType: 'none',
          authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform'
          }
        });

        await db.collection('challenges').doc(userId).set({
          challenge: options.challenge,
          timestamp: admin.firestore.Timestamp.now()
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(options)
        };
      }

      case 'register/verify': {
        const { userId, registration } = body;
        const challengeDoc = await db.collection('challenges').doc(userId).get();
        const expectedChallenge = challengeDoc.data()?.challenge;

        if (!expectedChallenge) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No challenge found' })
          };
        }

        const verification = await verifyRegistrationResponse({
          response: registration,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID
        });

        if (verification.verified && verification.registrationInfo) {
          await db.collection('authenticators').doc(userId).set({
            credentialID: isoBase64URL.fromBuffer(verification.registrationInfo.credentialID),
            credentialPublicKey: isoBase64URL.fromBuffer(verification.registrationInfo.credentialPublicKey),
            counter: verification.registrationInfo.counter,
            transports: registration.response.transports,
            userId,
            createdAt: admin.firestore.Timestamp.now()
          });

          await db.collection('users').doc(userId).set({
            hasPasskey: true,
            updatedAt: admin.firestore.Timestamp.now()
          }, { merge: true });
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ verified: verification.verified })
        };
      }

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not found' })
        };
    }
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};