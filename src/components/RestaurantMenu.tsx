import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Star, Clock, Plus, Minus, ShoppingBag } from 'lucide-react';
const RestaurantMenu = ({ restaurant, onBack }) => {
    const [cart, setCart] = useState({});
    const [activeCategory, setActiveCategory] = useState('Popular');
    const categoryRefs = useRef({});
    const [scrollingToCategory, setScrollingToCategory] = useState(false);
    const menuItems = [
        {
            id: '1',
            name: 'Signature Roll',
            description: 'Fresh salmon, avocado, cucumber with special sauce',
            price: 15.99,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
            category: 'Popular',
        },
        {
            id: '2',
            name: 'Dragon Roll',
            description: 'Eel, cucumber, topped with avocado',
            price: 16.99,
            imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80',
            category: 'Popular',
        },
        {
            id: '3',
            name: 'California Roll',
            description: 'Crab meat, avocado, cucumber',
            price: 12.99,
            imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&q=80',
            category: 'Rolls',
        },
        // Add more items for each category
        ...Array.from({ length: 5 }, (_, i) => ({
            id: `4${i}`,
            name: `Sashimi ${i + 1}`,
            description: 'Fresh sliced fish',
            price: 14.99 + i,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
            category: 'Sashimi',
        })),
        ...Array.from({ length: 5 }, (_, i) => ({
            id: `5${i}`,
            name: `Appetizer ${i + 1}`,
            description: 'Traditional Japanese appetizer',
            price: 8.99 + i,
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
            category: 'Appetizers',
        })),
    ];
    const categories = ['Popular', 'Rolls', 'Sashimi', 'Appetizers', 'Drinks'];
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
        const item = menuItems.find(item => item.id === itemId);
        return sum + (item?.price || 0) * count;
    }, 0);
    // Handle scroll position to update active category
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
    // Scroll to category when clicked
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
      {/* Restaurant Header */}
      <div className="relative h-64">
        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"/>
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-white">
          <ChevronLeft className="w-6 h-6"/>
        </button>
        <div className="absolute bottom-0 left-0 p-4">
          <h1 className="text-white text-2xl font-bold">{restaurant.name}</h1>
          <p className="text-gray-200 text-sm">{restaurant.cuisine}</p>
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

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto pb-32">
        {categories.map(category => {
            const categoryItems = menuItems.filter(item => item.category === category);
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
                      <span className="text-white font-medium">${item.price}</span>
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
export default RestaurantMenu;
