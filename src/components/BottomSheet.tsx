import React from 'react';
import AddressInput from './AddressInput';
import PriceEstimator from './PriceEstimator';
import DriverMatching from './DriverMatching';
const BottomSheet = ({ pickupAddress, dropoffAddress, onPickupChange, onDropoffChange, onPickupSelect, onDropoffSelect, serviceType, isMatchingDriver, onClose, onConfirm, isEnabled, }) => {
    return (<div className="fixed inset-x-0 bottom-0 z-10">
      <div className="bg-[#001E3C] rounded-t-2xl shadow-lg">
        {!isMatchingDriver ? (<>
            <AddressInput pickupAddress={pickupAddress} dropoffAddress={dropoffAddress} onPickupChange={onPickupChange} onDropoffChange={onDropoffChange} onPickupSelect={onPickupSelect} onDropoffSelect={onDropoffSelect} serviceType={serviceType}/>
            <PriceEstimator serviceType={serviceType} onConfirm={onConfirm} isEnabled={isEnabled}/>
          </>) : (<DriverMatching onClose={onClose}/>)}
      </div>
    </div>);
};
export default BottomSheet;
