"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag, ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useWishlist } from "@/store/wishlist";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem, isAuthenticated } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-brand-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gray-800">
            <Heart size={32} className="text-brand-gray-500" />
          </div>
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-brand-gray-400 mb-6">
            Vui lòng đăng nhập để lưu trữ và quản lý danh sách sản phẩm yêu thích của bạn
          </p>
          <Link href="/login" className="btn-primary inline-flex items-center gap-2">
            Đăng nhập ngay
          </Link>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-brand-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gray-800">
            <Heart size={32} className="text-brand-gray-500" />
          </div>
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
            Danh sách yêu thích trống
          </h2>
          <p className="text-brand-gray-400 mb-6">
            Bạn chưa lưu sản phẩm nào vào danh sách yêu thích
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            Khám phá sản phẩm
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-bold font-[var(--font-heading)]">
            Danh sách yêu thích ({items.length})
          </h1>
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="glass-card flex flex-col justify-between overflow-hidden group"
            >
              {/* Product Image */}
              <div className="aspect-square bg-brand-gray-900 overflow-hidden flex items-center justify-center shrink-0 relative border-b border-brand-gray-800">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <ShoppingBag size={48} className="text-brand-gray-600" />
                )}
                
                {/* Remove from wishlist button top-right */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-3 right-3 p-2 bg-brand-black/80 hover:bg-brand-red hover:text-white rounded-full text-brand-gray-400 transition-colors shadow-md border border-brand-gray-800"
                  title="Xóa khỏi danh sách"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Product Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] group-hover:text-brand-red transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-brand-red font-bold text-lg">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/products/${item.productId}`}
                    className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm"
                  >
                    <ExternalLink size={16} />
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
