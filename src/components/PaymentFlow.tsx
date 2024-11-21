import React, { useState, useEffect } from 'react';
import { CreditCard, X } from 'lucide-react';
const PaymentFlow = ({ amount, onClose, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);
    const handlePayment = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsVisible(false);
        setTimeout(onComplete, 300);
    };
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };
    return (<div className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}/>

      <div className={`relative w-full bg-[#1C1C1E] transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="relative px-4 py-3 text-center border-b border-[#38383A]">
          <button onClick={handleClose} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0072E5]">
            <X className="w-6 h-6"/>
          </button>
          <h2 className="text-white text-base font-medium">Confirm Payment</h2>
        </div>

        <div className="p-3 space-y-3">
          <div className="bg-[#2C2C2E] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#0072E5]"/>
                <div>
                  <p className="text-white text-sm font-medium">CoinConnect Card</p>
                  <p className="text-[#8E8E93] text-xs">•••• 4242</p>
                </div>
              </div>
              <div className="text-white text-sm font-medium">${amount}</div>
            </div>
          </div>

          {/* Add Payment Method Button */}
          <button className="w-full py-2.5 rounded-xl text-sm font-medium bg-[#2C2C2E] text-[#0072E5] hover:bg-[#3A3A3C] transition-colors">
            Add Payment Method
          </button>

          {/* Centered Double Click Section */}
          <div className="flex-1 py-8 flex flex-col items-center justify-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#2C2C2E] flex items-center justify-center mb-2">
              {isProcessing ? (<div className="w-5 h-5 border-2 border-[#0072E5] border-t-transparent rounded-full animate-spin"/>) : (<svg viewBox="0 0 24 24" className="w-5 h-5 text-[#0072E5]" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/>
                </svg>)}
            </div>
            <p className="text-[#8E8E93] text-xs">
              {isProcessing ? 'Processing payment...' : 'Double Click to Pay'}
            </p>
          </div>
        </div>

        {/* Pay Button - Fixed at bottom */}
        <div className="px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-[#0072E5] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#0059B2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Pay ${amount}
          </button>
        </div>
      </div>
    </div>);
};
export default PaymentFlow;
