import React, { useState, useEffect } from 'react';
import { Share, X } from 'lucide-react';

interface IOSInstallPromptProps {
  onModalOpen: () => void;
  onModalClose: () => void;
}

const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ onModalOpen, onModalClose }) => {
  const [showModal, setShowModal] = useState(false);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  
  const handleModalOpen = () => {
    setShowModal(true);
    onModalOpen();
  };

  const handleModalClose = () => {
    setShowModal(false);
    onModalClose();
  };

  if (isPWA) return null;

  return (
    <>
      <button 
        onClick={handleModalOpen}
        className="w-full bg-[#132F4C] border border-[#265D97] rounded-lg p-3 hover:bg-[#1E4976] transition-colors text-left"
      >
        <div className="flex items-center space-x-2">
          <Share className="w-4 h-4 text-[#66B2FF] flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium text-sm">Install CoinConnect</h3>
            <p className="text-xs text-[#B2BAC2]">
              Tap here to see how to add to your Home Screen
            </p>
          </div>
        </div>
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            transition: 'backdrop-filter 0.3s ease-out',
          }}
        >
          <div 
            className="bg-[#132F4C] rounded-xl w-[85%] max-w-[320px] p-6 relative shadow-xl border border-[#265D97]/30"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'modal-popup 0.3s ease-out forwards'
            }}
          >
            <button 
              onClick={handleModalClose}
              className="absolute right-4 top-4 text-[#B2BAC2] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center pt-2">
              <h2 className="text-2xl font-bold text-white mb-6">Install CoinConnect</h2>
              <div className="space-y-6 text-[#B2BAC2] text-base">
                <div className="flex flex-col items-center space-y-2">
                  <p>1. Tap the share button below</p>
                  <Share className="w-6 h-6 text-[#66B2FF]" />
                </div>
                <p>2. Scroll down and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to install</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IOSInstallPrompt; 