import React from 'react';
import { DollarSign, Clock } from 'lucide-react';
const PriceEstimator = ({ serviceType, onConfirm, isEnabled = true }) => {
    const estimates = {
        ride: {
            price: '15-20',
            time: '10-15',
            options: ['Economy', 'Comfort', 'Premium'],
        },
        food: {
            price: '25-35',
            time: '30-45',
            options: ['Standard', 'Priority', 'Express'],
        },
        grocery: {
            price: '50-75',
            time: '45-60',
            options: ['Same Day', 'Next Day', 'Scheduled'],
        },
    };
    const currentEstimate = estimates[serviceType];
    return (<div className="price-estimator-container space-y-3 border-t border-[#132F4C]">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between p-2 bg-[#132F4C] rounded-lg">
          <div className="flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-[#B2BAC2]"/>
            <span className="text-xs text-[#B2BAC2]">Price:</span>
          </div>
          <span className="text-sm font-medium text-white">${currentEstimate.price}</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-[#132F4C] rounded-lg">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-[#B2BAC2]"/>
            <span className="text-xs text-[#B2BAC2]">Time:</span>
          </div>
          <span className="text-sm font-medium text-white">{currentEstimate.time}m</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {currentEstimate.options.map((option, index) => (<button key={option} className={`p-2 rounded-lg text-xs font-medium transition-colors ${index === 0
                ? 'bg-[#0072E5] text-white'
                : 'bg-[#132F4C] text-[#B2BAC2] hover:bg-[#1E4976]'}`}>
            {option}
          </button>))}
      </div>

      <button onClick={onConfirm} disabled={!isEnabled} className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${isEnabled
            ? 'bg-[#0072E5] text-white hover:bg-[#0059B2]'
            : 'bg-[#132F4C] text-[#B2BAC2] cursor-not-allowed'}`}>
        {isEnabled
            ? `Confirm ${serviceType === 'ride' ? 'Ride' : serviceType === 'food' ? 'Order' : 'Delivery'}`
            : 'Select pickup and dropoff locations'}
      </button>
    </div>);
};
export default PriceEstimator;
