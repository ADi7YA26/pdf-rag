"use client"

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react"; // Install lucide-react for icons

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/ask', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userQuery,
          fileId: 'First Flight - English Textbook_Class_X.pdf'
        })
      });

      const data = await res.json();
      
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: data.answer || "I couldn't process that request." 
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: "Error: Unable to connect to the server." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto border-x bg-gray-50 shadow-2xl">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-none">PDF Assistant</h2>
            <p className="text-xs text-green-500 font-medium mt-1">Online</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Ask a question to get started.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gray-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
              <span className="text-xs text-gray-500">Analyzing PDF...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            placeholder="Search within document..."
            className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-700 border border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all text-sm outline-none disabled:bg-gray-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;