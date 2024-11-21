import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Search, X, Plus, Minus, ShoppingBag, Star, Clock } from 'lucide-react';
const GroceryStore = ({ store, onBack }) => {
    const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('Fruits & Vegetables');
    const categoryRefs = useRef({});
    const [scrollingToCategory, setScrollingToCategory] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const categories = ['Fruits & Vegetables', 'Dairy & Eggs', 'Meat & Seafood', 'Bakery', 'Beverages'];
    const items = [
        {
            id: '1',
            name: 'Fresh Apples',
            description: 'Fresh, crisp apples',
            price: 0.99,
            imageUrl: 'https://source.unsplash.com/800x600/?apple',
            category: 'Fruits & Vegetables',
        },
        {
            id: '2',
            name: 'Whole Milk',
            description: 'Fresh whole milk',
            price: 3.99,
            imageUrl: 'https://source.unsplash.com/800x600/?milk',
            category: 'Dairy & Eggs',
        },
        // Generate more items for each category
        ...Array.from({ length: 5 }, (_, i) => ({
            id: `3${i}`,
            name: `Fruit ${i + 1}`,
            description: 'Fresh seasonal fruit',
            price: 1.99 + i,
            imageUrl: 'https://source.unsplash.com/800x600/?fruit',
            category: 'Fruits & Vegetables',
        })),
    ];
    const addToCart = (itemId) => {
        setCart(prev => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
        }));
    };
    const removeFromCart = (itemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId]--;
            }
            else {
                delete newCart[itemId];
            }
            return newCart;
        });
    };
    const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
    const totalPrice = Object.entries(cart).reduce((sum, [itemId, count]) => {
        const item = items.find(item => item.id === itemId);
        return sum + (item?.price || 0) * count;
    }, 0);
    useEffect(() => {
        const handleScroll = (entries) => {
            if (scrollingToCategory)
                return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const category = entry.target.getAttribute('data-category');
                    if (category) {
                        setActiveCategory(category);
                    }
                }
            });
        };
        const observer = new IntersectionObserver(handleScroll, {
            threshold: 0.5,
            rootMargin: '-20% 0px -80% 0px'
        });
        Object.values(categoryRefs.current).forEach(ref => {
            if (ref)
                observer.observe(ref);
        });
        return () => observer.disconnect();
    }, [scrollingToCategory]);
    const scrollToCategory = (category) => {
        const ref = categoryRefs.current[category];
        if (ref) {
            setScrollingToCategory(true);
            ref.scrollIntoView({ behavior: 'smooth' });
            setActiveCategory(category);
            setTimeout(() => setScrollingToCategory(false), 1000);
        }
    };
    return (<div className="h-[calc(100vh-120px)] flex flex-col bg-[#0A1929]">
      {/* Store Header */}
      <div className="relative h-64">
        <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white">
          <ChevronLeft className="w-6 h-6"/>
        </button>
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="text-white text-2xl font-bold">{store.name}</h1>
          <p className="text-gray-200 text-sm">{store.type}</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center text-yellow-400">
              <Star className="w-4 h-4 fill-current"/>
              <span className="ml-1 text-sm text-white">{store.rating}</span>
            </div>
            <div className="flex items-center text-white">
              <Clock className="w-4 h-4"/>
              <span className="ml-1 text-sm">{store.deliveryTime}m</span>
            </div>
            <span className="text-white text-sm">${store.deliveryFee} delivery</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-0 z-10 bg-[#0A1929] border-b border-[#132F4C] shadow-lg">
        <div className="px-4 overflow-x-auto">
          <div className="flex space-x-4 py-4">
            {categories.map(category => (<button key={category} onClick={() => scrollToCategory(category)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === category
                ? 'bg-[#0072E5] text-white'
                : 'bg-[#132F4C] text-[#B2BAC2] hover:bg-[#1E4976]'}`}>
                {category}
              </button>))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-[#0A1929] border-b border-[#132F4C]">
        <div className="relative">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." className="w-full bg-[#132F4C] text-white rounded-lg pl-10 pr-4 py-2.5 placeholder-[#B2BAC2] focus:outline-none focus:ring-2 focus:ring-[#0072E5]"/>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#66B2FF]"/>
          {searchQuery && (<button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B2BAC2] hover:text-white">
              <X className="w-5 h-5"/>
            </button>)}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto pb-32">
        {categories.map(category => {
            const categoryItems = items.filter(item => item.category === category &&
                (searchQuery
                    ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase())
                    : true));
            if (categoryItems.length === 0)
                return null;
            return (<div key={category} ref={el => categoryRefs.current[category] = el} data-category={category} className="p-4 space-y-4">
              <h2 className="text-white text-xl font-bold sticky top-0">{category}</h2>
              {categoryItems.map(item => (<div key={item.id} className="flex space-x-4 bg-[#132F4C] p-4 rounded-xl">
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-lg object-cover"/>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-[#B2BAC2] text-sm mt-1">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white font-medium">${item.price.toFixed(2)}</span>
                      <div className="flex items-center space-x-2">
                        {cart[item.id] ? (<>
                            <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-[#1E4976] text-white flex items-center justify-center hover:bg-[#265D97] transition-colors">
                              <Minus className="w-4 h-4"/>
                            </button>
                            <span className="text-white w-8 text-center">
                              {cart[item.id]}
                            </span>
                          </>) : null}
                        <button onClick={() => addToCart(item.id)} className="w-8 h-8 rounded-full bg-[#0072E5] text-white flex items-center justify-center hover:bg-[#0059B2] transition-colors">
                          <Plus className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>);
        })}
      </div>

      {/* Cart Summary */}
      {totalItems > 0 && (<div className="fixed bottom-[64px] left-0 right-0 p-4 bg-[#132F4C] border-t border-[#265D97]">
          <button className="w-full bg-[#0072E5] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0059B2] transition-colors flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5"/>
              <span>{totalItems} items</span>
            </div>
            <span>View Cart • ${totalPrice.toFixed(2)}</span>
          </button>
        </div>)}
    </div>);
};
export default GroceryStore;
