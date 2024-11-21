import React, { useState } from 'react';
import { Car, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import ServiceSelector from './components/ServiceSelector';
import Map from './components/Map';
import BottomSheet from './components/BottomSheet';
import PhoneAuth from './components/PhoneAuth';
import PaymentFlow from './components/PaymentFlow';
import RestaurantList from './components/RestaurantList';
import RestaurantMenu from './components/RestaurantMenu';
import GroceryList from './components/GroceryList';
import GroceryStore from './components/GroceryStore';

interface Location {
  lng: number;
  lat: number;
  address: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  imageUrl: string;
  featured: boolean;
}

interface GroceryStore {
  id: string;
  name: string;
  type: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  imageUrl: string;
  featured: boolean;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedService, setSelectedService] = useState<'ride' | 'food' | 'grocery'>('ride');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [isMatchingDriver, setIsMatchingDriver] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedGroceryStore, setSelectedGroceryStore] = useState<GroceryStore | null>(null);

  const handleLocationSelect = (location: Location) => {
    if (!pickupLocation) {
      setPickupLocation(location);
      setPickupAddress(location.address);
    } else if (!dropoffLocation) {
      setDropoffLocation(location);
      setDropoffAddress(location.address);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDirection('forward');
    setStep('phone');
  };

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    setPickupAddress(location.address);
  };

  const handleDropoffSelect = (location: Location) => {
    setDropoffLocation(location);
    setDropoffAddress(location.address);
  };

  const handleConfirm = () => {
    if (pickupLocation && dropoffLocation) {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setIsMatchingDriver(true);
  };

  const handleServiceSelect = (service: 'ride' | 'food' | 'grocery') => {
    if (service !== selectedService) {
      setSelectedService(service);
      setSelectedRestaurant(null);
      setSelectedGroceryStore(null);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0A1929]">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={isAuthenticated ? 'main' : 'auth'}
          timeout={500}
          classNames={{
            enter: 'main-enter',
            enterActive: 'main-enter-active',
            exit: 'auth-exit',
            exitActive: 'auth-exit-active'
          }}
          unmountOnExit
        >
          {isAuthenticated ? (
            <div className="h-full flex flex-col">
              <header className="fixed top-0 left-0 right-0 z-50">
                <div className="bg-[#0A1929]/95 backdrop-blur-md border-b border-[#132F4C]">
                  <div className="pt-safe-top" />
                  <div className="px-4 flex items-center h-12">
                    <div className="flex items-center space-x-2">
                      <Car className="w-5 h-5 text-[#66B2FF]" />
                      <span className="text-base font-bold text-white">CoinConnect</span>
                    </div>
                  </div>
                </div>
              </header>

              <main className="flex-1 pt-safe-top mt-12 relative">
                <SwitchTransition mode="out-in">
                  <CSSTransition
                    key={`${selectedService}-${selectedRestaurant?.id || selectedGroceryStore?.id || 'list'}`}
                    timeout={300}
                    classNames="slide"
                  >
                    <div className="absolute inset-0 top-0">
                      {selectedService === 'food' ? (
                        selectedRestaurant ? (
                          <RestaurantMenu
                            restaurant={selectedRestaurant}
                            onBack={() => setSelectedRestaurant(null)}
                          />
                        ) : (
                          <RestaurantList onSelectRestaurant={setSelectedRestaurant} />
                        )
                      ) : selectedService === 'grocery' ? (
                        selectedGroceryStore ? (
                          <GroceryStore
                            store={selectedGroceryStore}
                            onBack={() => setSelectedGroceryStore(null)}
                          />
                        ) : (
                          <GroceryList onSelectStore={setSelectedGroceryStore} />
                        )
                      ) : (
                        <div className="h-full relative">
                          <div className="absolute inset-0">
                            <Map 
                              isMatchingDriver={isMatchingDriver}
                              onLocationSelect={handleLocationSelect}
                              pickupLocation={pickupLocation ? { lng: pickupLocation.lng, lat: pickupLocation.lat } : undefined}
                              dropoffLocation={dropoffLocation ? { lng: dropoffLocation.lng, lat: dropoffLocation.lat } : undefined}
                            />
                          </div>
                          <BottomSheet
                            pickupAddress={pickupAddress}
                            dropoffAddress={dropoffAddress}
                            onPickupChange={setPickupAddress}
                            onDropoffChange={setDropoffAddress}
                            onPickupSelect={handlePickupSelect}
                            onDropoffSelect={handleDropoffSelect}
                            serviceType={selectedService}
                            isMatchingDriver={isMatchingDriver}
                            onClose={() => setIsMatchingDriver(false)}
                            onConfirm={handleConfirm}
                            isEnabled={!!pickupLocation && !!dropoffLocation}
                          />
                        </div>
                      )}
                    </div>
                  </CSSTransition>
                </SwitchTransition>
              </main>

              <footer className="service-nav-container">
                <nav className="service-nav">
                  <ServiceSelector
                    selectedService={selectedService}
                    onServiceSelect={handleServiceSelect}
                  />
                </nav>
              </footer>

              {showPayment && (
                <PaymentFlow
                  amount="15.20"
                  onClose={() => setShowPayment(false)}
                  onComplete={handlePaymentComplete}
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 z-50">
              <div className="flex flex-col h-full">
                <PhoneAuth onComplete={() => {
                  setTimeout(() => {
                    setIsAuthenticated(true);
                  }, 500);
                }} />
              </div>
            </div>
          )}
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
};

export default App;