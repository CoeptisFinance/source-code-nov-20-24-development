import React, { useState, useRef, useEffect } from 'react';
import { Star, Clock, Search, X } from 'lucide-react';
const RestaurantList = ({ onSelectRestaurant }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrollProgress, setScrollProgress] = useState(0);
    const containerRef = useRef(null);
    // Handle scroll progress
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
            setScrollProgress(Math.min(progress, 100));
        }
    };
    // Generate restaurant data
    const generateRestaurants = (pageNum) => {
        const startId = (pageNum - 1) * 10;
        return Array.from({ length: 10 }, (_, index) => ({
            id: `restaurant-${startId + index + 1}`,
            name: `Restaurant ${startId + index + 1}`,
            cuisine: ['Japanese • Sushi', 'Italian • Pizza', 'American • Burgers', 'Mexican • Tacos'][Math.floor(Math.random() * 4)],
            rating: Number((4 + Math.random()).toFixed(1)),
            deliveryTime: `${15 + Math.floor(Math.random() * 30)}`,
            deliveryFee: (2 + Math.random() * 3).toFixed(2),
            imageUrl: [
                'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
                'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&q=80',
                'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
                'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800&q=80'
            ][Math.floor(Math.random() * 4)],
            featured: Math.random() > 0.8
        }));
    };
    const loadMore = async () => {
        if (loading || !hasMore)
            return;
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newRestaurants = generateRestaurants(page);
        setRestaurants(prev => [...prev, ...newRestaurants]);
        setPage(prev => prev + 1);
        setHasMore(page < 5); // Limit to 5 pages for demo
        setLoading(false);
    };
    // Load initial restaurants
    useEffect(() => {
        loadMore();
    }, []);
    // Add scroll event listener
    useEffect(() => {
        const currentRef = containerRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
            return () => currentRef.removeEventListener('scroll', handleScroll);
        }
    }, []);
    // Filter restaurants based on search
    const filteredRestaurants = restaurants.filter(restaurant => restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));
    const featuredRestaurants = filteredRestaurants.filter(r => r.featured);
    const regularRestaurants = filteredRestaurants.filter(r => !r.featured);
    return (<div className="h-[calc(100vh-120px)] flex flex-col bg-[#0A1929]">
      {/* Search Bar */}
      <div className="restaurant-search">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search restaurants or cuisines..." className="w-full bg-[#132F4C] text-white rounded-lg pl-10 pr-4 py-2.5 placeholder-[#B2BAC2] focus:outline-none focus:ring-2 focus:ring-[#0072E5]"/>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#66B2FF]"/>
          {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B2BAC2] hover:text-white">
              <X className="w-5 h-5"/>
            </button>)}
        </div>
      </div>

      {/* Restaurant Lists */}
      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && (<div className="p-4">
            <h2 className="text-white text-lg font-semibold mb-3">Featured Restaurants</h2>
            <div className="grid grid-cols-1 gap-4">
              {featuredRestaurants.map(restaurant => (<button key={restaurant.id} onClick={() => onSelectRestaurant(restaurant)} className="bg-[#132F4C] rounded-xl overflow-hidden hover:bg-[#1E4976] transition-colors">
                  <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-48 object-cover"/>
                  <div className="p-4">
                    <h3 className="text-white font-medium">{restaurant.name}</h3>
                    <p className="text-[#B2BAC2] text-sm">{restaurant.cuisine}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current"/>
                        <span className="ml-1 text-sm text-white">{restaurant.rating}</span>
                      </div>
                      <div className="flex items-center text-white">
                        <Clock className="w-4 h-4"/>
                        <span className="ml-1 text-sm">{restaurant.deliveryTime}m</span>
                      </div>
                      <span className="text-white text-sm">${restaurant.deliveryFee} delivery</span>
                    </div>
                  </div>
                </button>))}
            </div>
          </div>)}

        {/* Regular Restaurants */}
        <div className="p-4">
          <h2 className="text-white text-lg font-semibold mb-3">All Restaurants</h2>
          <div className="grid grid-cols-1 gap-4">
            {regularRestaurants.map(restaurant => (<button key={restaurant.id} onClick={() => onSelectRestaurant(restaurant)} className="bg-[#132F4C] rounded-xl overflow-hidden hover:bg-[#1E4976] transition-colors">
                <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="text-white font-medium">{restaurant.name}</h3>
                  <p className="text-[#B2BAC2] text-sm">{restaurant.cuisine}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current"/>
                      <span className="ml-1 text-sm text-white">{restaurant.rating}</span>
                    </div>
                    <div className="flex items-center text-white">
                      <Clock className="w-4 h-4"/>
                      <span className="ml-1 text-sm">{restaurant.deliveryTime}m</span>
                    </div>
                    <span className="text-white text-sm">${restaurant.deliveryFee} delivery</span>
                  </div>
                </div>
              </button>))}
          </div>
        </div>

        {/* No Results Message */}
        {filteredRestaurants.length === 0 && !loading && (<div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-[#132F4C] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#66B2FF]"/>
            </div>
            <h3 className="text-white font-medium mb-2">No restaurants found</h3>
            <p className="text-[#B2BAC2] text-sm">
              Try adjusting your search to find what you're looking for
            </p>
          </div>)}

        {/* Load More Button */}
        {hasMore && (<div className="p-4">
            <button onClick={loadMore} disabled={loading} className="w-full py-3 px-4 bg-[#132F4C] text-white rounded-lg hover:bg-[#1E4976] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Loading...' : 'Show More'}
            </button>
          </div>)}
      </div>
    </div>);
};
export default RestaurantList;
