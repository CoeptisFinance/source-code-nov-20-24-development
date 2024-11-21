import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Star } from 'lucide-react';
const GroceryList = ({ onSelectStore }) => {
    const [stores, setStores] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const containerRef = useRef(null);
    const generateStores = (pageNum) => {
        return Array.from({ length: 10 }, (_, i) => ({
            id: `store-${pageNum}-${i}`,
            name: `Grocery Store ${pageNum * 10 + i + 1}`,
            type: ['Supermarket', 'Convenience Store', 'Organic Market'][Math.floor(Math.random() * 3)],
            rating: 4 + Math.random(),
            deliveryTime: `${10 + Math.floor(Math.random() * 20)}`,
            deliveryFee: (2 + Math.random() * 3).toFixed(2),
            imageUrl: `https://source.unsplash.com/800x600/?grocery,store&${pageNum}-${i}`,
            featured: i === 0 && pageNum === 1
        }));
    };
    const handleScroll = () => {
        if (!containerRef.current || loading || !hasMore)
            return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop <= clientHeight * 1.5) {
            loadMore();
        }
    };
    const loadMore = async () => {
        if (loading || !hasMore)
            return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newStores = generateStores(page);
        setStores(prev => [...prev, ...newStores]);
        setPage(prev => prev + 1);
        setHasMore(page < 5);
        setLoading(false);
    };
    useEffect(() => {
        loadMore();
    }, []);
    useEffect(() => {
        const currentRef = containerRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
            return () => currentRef.removeEventListener('scroll', handleScroll);
        }
    }, []);
    const filteredStores = stores.filter(store => store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.type.toLowerCase().includes(searchQuery.toLowerCase()));
    const featuredStores = filteredStores.filter(s => s.featured);
    const regularStores = filteredStores.filter(s => !s.featured);
    return (<div className="h-[calc(100vh-120px)] flex flex-col bg-[#0A1929]">
      <div className="restaurant-search">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search grocery stores..." className="w-full bg-[#132F4C] text-white rounded-lg pl-10 pr-4 py-2.5 placeholder-[#B2BAC2] focus:outline-none focus:ring-2 focus:ring-[#0072E5]"/>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#66B2FF]"/>
          {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B2BAC2] hover:text-white">
              <X className="w-5 h-5"/>
            </button>)}
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        {featuredStores.length > 0 && (<div className="p-4">
            <h2 className="text-white text-lg font-semibold mb-3">Featured Stores</h2>
            <div className="grid grid-cols-1 gap-4">
              {featuredStores.map(store => (<button key={store.id} onClick={() => onSelectStore(store)} className="bg-[#132F4C] rounded-xl overflow-hidden hover:bg-[#1E4976] transition-colors">
                  <img src={store.imageUrl} alt={store.name} className="w-full h-48 object-cover"/>
                  <div className="p-4">
                    <h3 className="text-white font-medium">{store.name}</h3>
                    <p className="text-[#B2BAC2] text-sm">{store.type}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current"/>
                        <span className="ml-1 text-sm text-white">{store.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center text-white">
                        <Clock className="w-4 h-4"/>
                        <span className="ml-1 text-sm">{store.deliveryTime}m</span>
                      </div>
                      <span className="text-white text-sm">${store.deliveryFee} delivery</span>
                    </div>
                  </div>
                </button>))}
            </div>
          </div>)}

        <div className="p-4">
          <h2 className="text-white text-lg font-semibold mb-3">All Stores</h2>
          <div className="grid grid-cols-1 gap-4">
            {regularStores.map(store => (<button key={store.id} onClick={() => onSelectStore(store)} className="bg-[#132F4C] rounded-xl overflow-hidden hover:bg-[#1E4976] transition-colors">
                <img src={store.imageUrl} alt={store.name} className="w-full h-48 object-cover"/>
                <div className="p-4">
                  <h3 className="text-white font-medium">{store.name}</h3>
                  <p className="text-[#B2BAC2] text-sm">{store.type}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 fill-current"/>
                      <span className="ml-1 text-sm text-white">{store.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center text-white">
                      <Clock className="w-4 h-4"/>
                      <span className="ml-1 text-sm">{store.deliveryTime}m</span>
                    </div>
                    <span className="text-white text-sm">${store.deliveryFee} delivery</span>
                  </div>
                </div>
              </button>))}
          </div>
        </div>

        {loading && (<div className="p-4 text-center text-[#B2BAC2]">
            Loading more stores...
          </div>)}
      </div>
    </div>);
};
export default GroceryList;
