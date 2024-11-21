import React, { useEffect, useState } from 'react';
import { X, Car, Star, Phone, MessageSquare } from 'lucide-react';
import ChatWithDriver from './ChatWithDriver';
import { CSSTransition } from 'react-transition-group';
const DriverMatching = ({ onClose }) => {
    const [matchingStep, setMatchingStep] = useState('searching');
    const [progress, setProgress] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    // Add mock locations for testing
    const mockLocations = {
        driverLocation: { lng: -73.935242, lat: 40.730610 },
        pickupLocation: { lng: -73.935242, lat: 40.730610 },
        dropoffLocation: { lng: -73.991251, lat: 40.735681 }
    };
    useEffect(() => {
        if (matchingStep === 'searching') {
            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setMatchingStep('matched');
                        clearInterval(timer);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 50);
            return () => clearInterval(timer);
        }
    }, [matchingStep]);
    return (<div className="p-4 space-y-3">
      <CSSTransition in={showChat} timeout={300} classNames="slide" unmountOnExit>
        <ChatWithDriver onClose={() => setShowChat(false)}/>
      </CSSTransition>

      {!showChat && (<>
          {matchingStep === 'searching' ? (<>
              <div className="flex justify-between items-center">
                <h2 className="text-base font-semibold text-white">Finding your driver</h2>
                <button onClick={onClose} className="text-[#B2BAC2] hover:text-white">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="flex flex-col items-center space-y-3 py-3">
                <div className="relative">
                  <Car className="w-10 h-10 text-[#66B2FF] animate-pulse"/>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#0072E5] rounded-full animate-ping"/>
                </div>
                <div className="w-full bg-[#132F4C] rounded-full h-1.5">
                  <div className="bg-[#0072E5] h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}/>
                </div>
                <p className="text-[#B2BAC2] text-xs">Connecting you with nearby drivers...</p>
              </div>
            </>) : (<>
              <div className="flex items-start space-x-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces" alt="Driver" className="w-12 h-12 rounded-full object-cover border-2 border-[#0072E5]"/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white text-sm font-medium truncate">Michael Chen</h3>
                    <div className="flex items-center text-yellow-400 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current"/>
                      <span className="text-xs ml-0.5">4.92</span>
                    </div>
                  </div>
                  <p className="text-[#B2BAC2] text-xs truncate">Tesla Model 3 • ABC 123</p>
                  <p className="text-[#66B2FF] text-xs">3 minutes away</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center space-x-1.5 bg-[#132F4C] py-2 px-3 rounded-lg hover:bg-[#1E4976] transition-colors">
                  <Phone className="w-4 h-4 text-[#66B2FF]"/>
                  <span className="text-white text-xs font-medium">Call</span>
                </button>
                <button onClick={() => setShowChat(true)} className="flex items-center justify-center space-x-1.5 bg-[#132F4C] py-2 px-3 rounded-lg hover:bg-[#1E4976] transition-colors">
                  <MessageSquare className="w-4 h-4 text-[#66B2FF]"/>
                  <span className="text-white text-xs font-medium">Message</span>
                </button>
              </div>

              <button onClick={() => setShowCancelModal(true)} className="w-full mt-2 py-2 px-3 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium">
                Cancel Ride
              </button>

              {showCancelModal && (<div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                  <div className="bg-[#132F4C] rounded-xl p-4 w-full max-w-sm">
                    <h3 className="text-white text-lg font-semibold mb-2">Cancel Ride?</h3>
                    <p className="text-[#B2BAC2] text-sm mb-4">
                      You may be charged a cancellation fee of $5.00
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setShowCancelModal(false)} className="py-2 px-4 rounded-lg bg-[#0A1929] text-white text-sm font-medium hover:bg-[#1E4976] transition-colors">
                        Keep Ride
                      </button>
                      <button onClick={() => {
                        setShowCancelModal(false);
                        onClose();
                    }} className="py-2 px-4 rounded-lg bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors">
                        Yes, Cancel
                      </button>
                    </div>
                  </div>
                </div>)}
            </>)}
        </>)}
    </div>);
};
export default DriverMatching;
