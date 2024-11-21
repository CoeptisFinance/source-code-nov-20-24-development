import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, Lock, User, Car } from 'lucide-react';
import IOSInstallPrompt from './IOSInstallPrompt';
import PasskeyAuth from './auth/PasskeyAuth';
import { auth } from '../config/firebase.ts';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  PhoneAuthProvider
} from 'firebase/auth';
import { passkeyService } from '../services/passkey';

const PhoneAuth = ({ onComplete }) => {
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState('forward');
  const codeInputRef = useRef(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const inputRefs = useRef([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const [verificationId, setVerificationId] = useState('');

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setDirection('forward');
    setStep('phone');
  };

  const handleSMSVerification = async (code: string) => {
    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      const userCredential = await linkWithCredential(auth.currentUser, credential);
      
      // After SMS verification, register passkey
      const supported = await passkeyService.checkPasskeySupport();
      if (supported) {
        await passkeyService.registerPasskey(userCredential.user.uid, name);
      }
      
      onComplete(userCredential.user.uid);
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Clear any existing recaptcha
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Initialize reCAPTCHA
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
        }
      });

      window.recaptchaVerifier = verifier;

      // Format phone number
      const formattedPhone = `+1${phoneNumber.replace(/\D/g, '')}`;

      console.log('Attempting to send code to:', formattedPhone);

      // Request SMS verification
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      // Store confirmation result
      window.confirmationResult = confirmationResult;

      setDirection('forward');
      setStep('code');
    } catch (error) {
      console.error('Error sending code:', error);
      setError(error.message || 'Failed to send verification code');

      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!window.confirmationResult) {
        throw new Error('No verification session found');
      }

      // Verify the code
      const result = await window.confirmationResult.confirm(code);
      const user = result.user;

      console.log('Phone verification successful:', user);

      // After phone verification, attempt passkey registration
      if (passkeyService.isPasskeyAvailable()) {
        try {
          console.log('Starting passkey registration for:', user.uid, name || user.phoneNumber);
          const registered = await passkeyService.registerPasskey(
            user.uid,
            name || user.phoneNumber || ''
          );
          console.log('Passkey registration result:', registered);
        } catch (passkeyError) {
          console.error('Passkey registration error:', passkeyError);
          // Don't block the flow if passkey registration fails
          setError('Phone verification successful, but passkey setup failed');
        }
      }

      onComplete(user);
    } catch (error) {
      console.error('Code verification failed:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3)
      return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const getStepIcon = () => {
    if (!step) return null;
    
    switch (step) {
      case 'name':
        return <User className="w-8 h-8 text-[#66B2FF] user-icon-pop" key="name-icon" />;
      case 'phone':
        return <Phone className="w-8 h-8 text-[#66B2FF] phone-icon-ring" key="phone-icon" />;
      case 'code':
        return <Lock className="w-8 h-8 text-[#66B2FF] lock-icon-bounce" key="code-icon" />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'name':
        return "What's your name?";
      case 'phone':
        return 'Enter your phone number';
      case 'code':
        return 'Verify your number';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'name':
        return 'Let us know how to address you';
      case 'phone':
        return "We'll send you a code to verify your phone number";
      case 'code':
        return `We've sent a 6-digit code to ${phoneNumber}`;
    }
  };

  const handleComplete = async () => {
    setIsTransitioning(true);
    // Add class for transition
    document.documentElement.classList.add('transitioning');
    await new Promise(resolve => setTimeout(resolve, 500));
    onComplete();
    // Remove class after transition
    document.documentElement.classList.remove('transitioning');
  };

  const handlePhoneChange = (e) => {
    // Only handle formatting and state update
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    // Remove all auto-submission logic
  };

  const renderCurrentStep = () => {
    return (
      <div className="w-full max-w-md bg-primary/80 backdrop-blur-lg rounded-2xl shadow-xl border border-secondary animate-fadeIn">
        <div className="p-6 pb-0">
          <div className="text-center mb-6">
            <div className="mb-6 flex justify-center">
              <div className="bg-[#132F4C]/50 p-4 rounded-full">
                {getStepIcon()}
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {getStepTitle()}
            </h2>
            <p className="text-[#B2BAC2] text-sm">
              {getStepDescription()}
            </p>
          </div>

          <form className="space-y-4 mb-3" onSubmit={
            step === 'name' ? handleNameSubmit :
              step === 'phone' ? handlePhoneSubmit :
                handleCodeSubmit
          }>
            {step === 'name' && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-[#132F4C] border border-[#265D97] rounded-lg focus:ring-[#0072E5] focus:border-[#0072E5] text-white placeholder-[#B2BAC2] text-lg"
                required
              />
            )}
            {step === 'phone' && (
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 555-5555"
                className="block w-full px-4 py-3 text-lg bg-[#132F4C] border border-[#265D97] rounded-lg focus:ring-[#0072E5] focus:border-[#0072E5] text-white placeholder-[#B2BAC2]"
                required
              />
            )}
            {step === 'code' && (
              <div className="flex gap-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={code[i] || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.match(/^[0-9]$/)) {
                        const newCode = [...code];
                        newCode[i] = value;
                        setCode(newCode.join(''));
                        if (i < 5 && inputRefs.current[i + 1]) {
                          inputRefs.current[i + 1].focus();
                        }
                      }
                    }}
                    className="w-12 h-12 text-center bg-[#132F4C] border border-[#265D97] rounded-lg focus:ring-[#0072E5] focus:border-[#0072E5] text-white text-lg"
                    required
                  />
                ))}
              </div>
            )}
            <button
              type="submit"
              className="w-full mt-4 py-3 px-4 bg-[#0072E5] text-white rounded-lg font-medium hover:bg-[#0059B2] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
          <div id="recaptcha-container" className="!invisible fixed top-0 left-0"></div>
        </div>
      </div>
    );
  };

  return (<div className={`fixed inset-0 flex flex-col bg-[#001E3C] text-white
        ${isTransitioning ? 'animate-fadeOutUp' : ''}`} style={{
      animationDuration: '500ms',
      animationFillMode: 'forwards'
    }}>
    {/* Main content container that will be blurred */}
    <div className={`flex-1 flex flex-col ${showInstallModal ? 'blur-lg' : ''}`}>
      <div className="pt-safe-top">
        <div className="bg-[#132F4C] overflow-hidden h-10 flex items-center">
          <div className="animate-scroll-x flex whitespace-nowrap">
            <span className="inline-flex items-center px-4 text-[#66B2FF]">
              🎉 Welcome to CoinConnect! Get 50% off your first ride with code WELCOME50
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo section */}
        <div className="mb-4 mt-12 text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0072E5] to-[#66B2FF] mb-4">
            <Car className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            CoinConnect
          </h1>
          <p className="text-[#66B2FF]">Your Ride, Your Way</p>
        </div>

        {/* Render current step */}
        <div className="flex-1 flex flex-col items-center px-4 pb-4 overflow-y-auto">
          {renderCurrentStep()}
        </div>

        {/* Sign in with Passkey button */}
        <div className="px-4 pb-4">
          <PasskeyAuth onComplete={onComplete} />
        </div>
      </div>
    </div>

    {/* Install Prompt - Outside the blurred container */}
    <div className="px-8 pb-8 mt-2" style={{ filter: 'none' }}>
      <IOSInstallPrompt
        onModalOpen={() => setShowInstallModal(true)}
        onModalClose={() => setShowInstallModal(false)}
      />
    </div>
  </div>
  );
};

export default PhoneAuth;