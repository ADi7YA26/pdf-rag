"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, FileText } from "lucide-react";
import { askQuestion } from "@/lib/api";
import { useDocument } from "@/lib/document-context";
import type { Message } from "@/lib/types";

export default function Chat() {
  const { uploadedFile } = useDocument();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Clear chat when a new document is loaded
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [uploadedFile?.fileId]);

  const handleSend = async () => {
    if (!input.trim() || loading || !uploadedFile) return;

    const userQuery = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setLoading(true);

    try {
      const data = await askQuestion(userQuery, uploadedFile.fileId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I couldn't find an answer in the document.",
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to connect to the server.";
      setError(msg);
      // Also surface the error inline in the chat thread
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDisabled = loading || !uploadedFile;

  return (
    <div className="flex flex-col flex-1 h-full max-w-3xl mx-auto border-x bg-gray-50 shadow-2xl">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-none">PDF Assistant</h2>
            <p className={`text-xs font-medium mt-0.5 ${uploadedFile ? "text-green-500" : "text-gray-400"}`}>
              {uploadedFile ? "Ready" : "No document loaded"}
            </p>
          </div>
        </div>

        {/* Active document badge */}
        {uploadedFile && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 max-w-[180px]">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{uploadedFile.name}</span>
          </div>
        )}
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-16 space-y-2">
            {uploadedFile ? (
              <>
                <p className="text-gray-500 text-sm font-medium">
                  Document ready
                </p>
                <p className="text-gray-400 text-xs">
                  Ask anything about <span className="font-medium">{uploadedFile.name}</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm">No document loaded yet.</p>
                <p className="text-gray-400 text-xs">Upload a PDF on the left to get started.</p>
              </>
            )}
          </div>
        )}

        {/* Message thread */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gray-700 text-white rounded-tr-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-400">Analyzing document…</span>
            </div>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-4 py-2 rounded-lg bg-red-50 border border-red-100 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        {!uploadedFile && (
          <p className="text-center text-xs text-gray-400 mb-2">
            Upload a PDF to enable the chat
          </p>
        )}
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={uploadedFile ? "Ask a question about the document…" : "Upload a PDF first…"}
            className="w-full pl-4 pr-12 py-3 rounded-xl text-gray-700 border border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 transition-all text-sm outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={isDisabled || !input.trim()}
            aria-label="Send message"
            className="absolute right-1.5 p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send size={17} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
