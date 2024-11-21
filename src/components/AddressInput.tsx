import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
const AddressInput = ({ pickupAddress, dropoffAddress, onPickupChange, onDropoffChange, onPickupSelect, onDropoffSelect, serviceType, }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeInput, setActiveInput] = useState(null);
    const [isEditing, setIsEditing] = useState({ pickup: false, dropoff: false });
    const getLabels = () => {
        switch (serviceType) {
            case 'ride':
                return { pickup: pickupAddress || 'Current Location', dropoff: 'Where to?' };
            case 'food':
                return { pickup: pickupAddress || 'Current Location', dropoff: 'Delivery Address' };
            case 'grocery':
                return { pickup: pickupAddress || 'Current Location', dropoff: 'Delivery Address' };
        }
    };
    const labels = getLabels();
    const handleInputFocus = (type) => {
        setActiveInput(type);
        setIsEditing({ ...isEditing, [type]: true });
        if (type === 'pickup') {
            onPickupChange('');
        }
        else {
            onDropoffChange('');
        }
    };
    const handleInputBlur = (type) => {
        setTimeout(() => {
            setIsEditing({ ...isEditing, [type]: false });
            if (!pickupAddress && type === 'pickup') {
                onPickupChange('Current Location');
            }
        }, 200);
    };
    const handleInputChange = async (value, type) => {
        if (type === 'pickup') {
            onPickupChange(value);
        }
        else {
            onDropoffChange(value);
        }
        if (value.length > 2) {
            try {
                // Get current position for proximity search
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { longitude, latitude } = position.coords;
                    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&country=US&proximity=${longitude},${latitude}&limit=5`);
                    const data = await response.json();
                    setSuggestions(data.features);
                    setShowSuggestions(true);
                }, async (error) => {
                    // Fallback if geolocation fails
                    console.error('Geolocation error:', error);
                    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}&country=US&limit=5`);
                    const data = await response.json();
                    setSuggestions(data.features);
                    setShowSuggestions(true);
                });
            }
            catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }
        else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };
    const handleCurrentLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { longitude, latitude } = position.coords;
            onPickupSelect({
                lng: longitude,
                lat: latitude,
                address: 'Current Location'
            });
        }, (error) => {
            console.error('Error getting location:', error);
        });
    };
    return (<div className="p-4 space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center cursor-pointer" onClick={handleCurrentLocation}>
          <Navigation className="h-4 w-4 text-[#66B2FF]"/>
        </div>
        <input type="text" value={isEditing.pickup ? pickupAddress : labels.pickup} onChange={(e) => handleInputChange(e.target.value, 'pickup')} onFocus={() => handleInputFocus('pickup')} onBlur={() => handleInputBlur('pickup')} placeholder="Enter pickup location" className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#132F4C] border border-[#265D97] rounded-lg focus:ring-[#0072E5] focus:border-[#0072E5] text-white placeholder-[#B2BAC2]"/>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <MapPin className="h-4 w-4 text-[#B2BAC2]"/>
        </div>
        <input type="text" value={dropoffAddress} onChange={(e) => handleInputChange(e.target.value, 'dropoff')} onFocus={() => handleInputFocus('dropoff')} placeholder={labels.dropoff} className="block w-full pl-9 pr-3 py-2.5 text-sm bg-[#132F4C] border border-[#265D97] rounded-lg focus:ring-[#0072E5] focus:border-[#0072E5] text-white placeholder-[#B2BAC2]"/>

        {showSuggestions && suggestions.length > 0 && (<div className="absolute z-10 w-full mt-1 bg-[#001E3C] border border-[#265D97] rounded-lg shadow-lg max-h-48 overflow-auto">
            {suggestions.map((suggestion, index) => (<button key={index} className="w-full text-left px-3 py-2 hover:bg-[#132F4C] text-white text-sm border-b border-[#265D97] last:border-b-0" onClick={() => {
                    if (activeInput === 'pickup') {
                        onPickupSelect({
                            lng: suggestion.center[0],
                            lat: suggestion.center[1],
                            address: suggestion.place_name
                        });
                    }
                    else {
                        onDropoffSelect({
                            lng: suggestion.center[0],
                            lat: suggestion.center[1],
                            address: suggestion.place_name
                        });
                    }
                    setShowSuggestions(false);
                    setActiveInput(null);
                }}>
                {suggestion.place_name}
              </button>))}
          </div>)}
      </div>
    </div>);
};
export default AddressInput;
