import React from 'react';
import { Download } from 'lucide-react';
const InstallPrompt = ({ onInstall, onDismiss }) => {
    return (<div className="fixed left-4 right-4 bottom-banner bg-[#132F4C] rounded-lg p-4 shadow-lg border border-[#265D97] animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Download className="w-6 h-6 text-[#66B2FF]"/>
          <div>
            <h3 className="text-white font-medium">Install CoinConnect</h3>
            <p className="text-sm text-[#B2BAC2]">Add to your home screen for quick access</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={onDismiss} className="px-3 py-1.5 text-sm text-[#B2BAC2] hover:text-white">
            Later
          </button>
          <button onClick={onInstall} className="px-3 py-1.5 text-sm bg-[#0072E5] text-white rounded-md hover:bg-[#0059B2]">
            Install
          </button>
        </div>
      </div>
    </div>);
};
export default InstallPrompt;
