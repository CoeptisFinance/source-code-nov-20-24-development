import React, { useState } from 'react';
import { Send, ChevronLeft } from 'lucide-react';
const ChatWithDriver = ({ onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm on my way to pick you up.",
            sender: 'driver',
            timestamp: new Date(Date.now() - 120000)
        },
        {
            id: 2,
            text: "I'm wearing a blue jacket and standing near the entrance.",
            sender: 'user',
            timestamp: new Date(Date.now() - 60000)
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const handleSend = () => {
        if (!newMessage.trim())
            return;
        setMessages([
            ...messages,
            {
                id: Date.now(),
                text: newMessage.trim(),
                sender: 'user',
                timestamp: new Date()
            }
        ]);
        setNewMessage('');
        // Simulate driver response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                    id: Date.now(),
                    text: "Got it! I'll be there in about 2 minutes.",
                    sender: 'driver',
                    timestamp: new Date()
                }]);
        }, 1000);
    };
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    return (<div className="fixed inset-0 bg-[#0A1929] z-[100] flex flex-col" style={{
            top: '48px',
            bottom: '56px',
            willChange: 'transform, opacity'
        }}>
      {/* Chat Header */}
      <div className="bg-[#132F4C] px-4 py-3 flex items-center space-x-4">
        <button onClick={onClose} className="text-white">
          <ChevronLeft className="w-6 h-6"/>
        </button>
        <div className="flex-1">
          <h2 className="text-white font-medium">Michael Chen</h2>
          <p className="text-[#B2BAC2] text-sm">Tesla Model 3 • ABC 123</p>
        </div>
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces" alt="Driver" className="w-10 h-10 rounded-full object-cover border-2 border-[#0072E5]"/>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Pill */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-[#00E5A0] rounded-full animate-pulse"/>
            <span className="text-gray-900 text-sm font-medium">Driver is 3 min away</span>
          </div>
        </div>
        
        {messages.map((message) => (<div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                ? 'bg-[#0072E5] text-white rounded-br-md'
                : 'bg-[#132F4C] text-white rounded-bl-md'}`}>
              <p className="text-[15px]">{message.text}</p>
              <p className="text-[11px] mt-1 opacity-60">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>))}
      </div>

      {/* Input */}
      <div className="p-4 bg-[#132F4C]">
        <div className="flex items-center space-x-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1 bg-[#001E3C] border border-[#265D97] rounded-lg px-4 py-2 text-white placeholder-[#B2BAC2] focus:outline-none focus:ring-2 focus:ring-[#0072E5]"/>
          <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-[#0072E5] text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0059B2] transition-colors">
            <Send className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>);
};
export default ChatWithDriver;
