// Restaurant related types
export interface Restaurant {
    id: string;
    name: string;
    cuisine: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: string;
    imageUrl: string;
    featured: boolean;
  }
  
  export interface RestaurantListProps {
    onSelectRestaurant: (restaurant: Restaurant) => void;
  }
  
  // Location related types
  export interface Location {
    lng: number;
    lat: number;
  }
  
  export interface MapProps {
    isMatchingDriver: boolean;
    driverLocation?: Location;
    pickupLocation?: Location;
    dropoffLocation?: Location;
    onLocationSelect: (location: Location) => void;
    isChatOpen?: boolean;
  }
  
  // Chat related types
  export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'driver';
    timestamp: Date;
  }
  
  export interface ChatWithDriverProps {
    onClose: () => void;
  }
  
  // Payment related types
  export interface PaymentFlowProps {
    amount: number;
    onClose: () => void;
    onComplete: () => void;
  }
  
  // Driver matching related types
  export interface DriverMatchingProps {
    onClose: () => void;
  }