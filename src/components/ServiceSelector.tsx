import React from 'react';
import { Car, UtensilsCrossed, ShoppingBag } from 'lucide-react';
const ServiceSelector = ({ selectedService, onServiceSelect }) => {
    const handleServiceClick = (service) => {
        if (service !== selectedService) {
            onServiceSelect(service);
        }
    };
    return (<div className="flex justify-around items-center h-12">
      <button onClick={() => handleServiceClick('ride')} className={`flex flex-col items-center space-y-1 ${selectedService === 'ride' ? 'text-[#66B2FF]' : 'text-[#B2BAC2]'}`}>
        <Car className="w-6 h-6"/>
        <span className="text-sm">Ride</span>
      </button>
      
      <button onClick={() => handleServiceClick('food')} className={`flex flex-col items-center space-y-1 ${selectedService === 'food' ? 'text-[#66B2FF]' : 'text-[#B2BAC2]'}`}>
        <UtensilsCrossed className="w-6 h-6"/>
        <span className="text-sm">Food</span>
      </button>
      
      <button onClick={() => handleServiceClick('grocery')} className={`flex flex-col items-center space-y-1 ${selectedService === 'grocery' ? 'text-[#66B2FF]' : 'text-[#B2BAC2]'}`}>
        <ShoppingBag className="w-6 h-6"/>
        <span className="text-sm">Grocery</span>
      </button>
    </div>);
};
export default ServiceSelector;
