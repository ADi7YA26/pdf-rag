"use client"

import { useState } from "react";

const Chat = ()  => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, input]);
    setInput("");
  };

  return (
     <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white">
        <h2 className="text-lg font-medium text-gray-800">
          Chat with PDF
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">
            Ask questions about your uploaded PDF...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="max-w-[75%] bg-white border rounded-xl px-4 py-2 text-sm shadow-sm"
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 px-4 py-2 rounded-full border text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-600"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-900 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat