import React, { useState } from 'react';
import { passkeyService } from '../../services/passkey';

interface PasskeyAuthProps {
  onComplete: (userId: string) => void;
}

const PasskeyAuth: React.FC<PasskeyAuthProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!passkeyService.isPasskeyAvailable()) {
        throw new Error('Passkeys are not supported in this browser');
      }

      const { userId, verified } = await passkeyService.authenticateWithPasskey();
      
      if (verified && userId) {
        onComplete(userId);
      } else {
        throw new Error('Passkey verification failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign in with Passkey'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </>
  );
};

export default PasskeyAuth;