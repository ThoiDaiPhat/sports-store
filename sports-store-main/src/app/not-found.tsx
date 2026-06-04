"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative text-center max-w-lg"
      >
        {/* Big 404 */}
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[120px] sm:text-[160px] font-extrabold font-[var(--font-heading)] leading-none text-brand-gray-800 select-none"
        >
          4
          <span className="text-brand-red">0</span>
          4
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)] mt-2">
            Oops! Trang không tồn tại
          </h2>
          <p className="text-brand-gray-500 mt-3 text-sm leading-relaxed max-w-md mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời
            không khả dụng. Hãy quay lại trang chủ hoặc tìm kiếm sản phẩm.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
        >
          <Link
            href="/"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Search size={16} />
            Tìm sản phẩm
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
