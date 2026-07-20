"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, Smile } from "lucide-react";
import type { WholesaleProduct } from "@/types/wholesale";

type Message = {
  id: string;
  content: string;
  sender: "user" | "supplier";
  timestamp: string;
  avatar?: string;
};

type SupplierChatProps = {
  product: WholesaleProduct;
  isOpen: boolean;
  onClose: () => void;
};

const initialMessages: Message[] = [
  {
    id: "welcome-1",
    content: "Hello! I'm your supplier for this product. How can I help you today?",
    sender: "supplier",
    timestamp: new Date().toISOString(),
  },
];

export default function SupplierChat({ product, isOpen, onClose }: SupplierChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // Simulate supplier response
    setTimeout(() => {
      const supplierMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: "Thank you for your message. I'll check the details and get back to you shortly.",
        sender: "supplier",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, supplierMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative flex h-[500px] w-full max-w-lg flex-col rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <span className="font-semibold">{product.supplier.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{product.supplier}</h3>
              <p className="text-sm text-slate-500">Product: {product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close chat"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.sender === "supplier" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <span className="text-xs font-semibold">{product.supplier.charAt(0)}</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span
                  className={`text-xs ${message.sender === "user" ? "text-emerald-100" : "text-slate-500"}`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="Attach file"
            >
              <Paperclip className="size-5" />
            </button>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}