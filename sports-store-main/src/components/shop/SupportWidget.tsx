"use client";

import { useState } from "react";
import { MessageCircle, X, MessageSquare, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Options Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="flex flex-col gap-2 mb-2"
          >
            {/* Zalo Option */}
            <a
              href="https://zalo.me/0562563677"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-brand-gray-900 border border-brand-gray-800 rounded-full shadow-lg text-xs font-semibold text-brand-white hover:border-brand-red transition-all group"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                Z
              </div>
              <span>Chat qua Zalo</span>
            </a>

            {/* Messenger Option */}
            <a
              href="https://m.me/sportstore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-brand-gray-900 border border-brand-gray-800 rounded-full shadow-lg text-xs font-semibold text-brand-white hover:border-brand-red transition-all group"
            >
              <div className="w-5 h-5 bg-gradient-to-tr from-blue-600 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                M
              </div>
              <span>Facebook Messenger</span>
            </a>

            {/* Hotline Option */}
            <a
              href="tel:0562563677"
              className="flex items-center gap-2 px-4 py-2 bg-brand-gray-900 border border-brand-gray-800 rounded-full shadow-lg text-xs font-semibold text-brand-white hover:border-brand-red transition-all group"
            >
              <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-white">
                <Phone size={10} />
              </div>
              <span>Hotline: 056.256.3677</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl text-white transition-transform active:scale-95 border ${
          isOpen
            ? "bg-brand-gray-200 border-brand-gray-800 hover:bg-brand-gray-100"
            : "bg-brand-red border-brand-red hover:bg-brand-red-hover animate-pulse-red"
        }`}
        title="Trợ giúp trực tuyến"
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
