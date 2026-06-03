"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBag
            size={64}
            className="mx-auto text-brand-gray-600 mb-4"
          />
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-brand-gray-400 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            Tiếp tục mua sắm
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
            Giỏ hàng ({items.length})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-brand-gray-400 hover:text-brand-red transition-colors flex items-center gap-1"
        >
          <Trash2 size={14} />
          Xóa tất cả
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => (
            <motion.div
              key={`${item.productId}-${item.size}-${item.color}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 sm:p-6 flex gap-4"
            >
              {/* Product Image */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-brand-gray-900 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative border border-brand-gray-800">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag size={24} className="text-brand-gray-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {item.name}
                </h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-brand-gray-400">
                    Size: {item.size}
                  </span>
                  <span className="text-xs text-brand-gray-400">
                    Màu: {item.color}
                  </span>
                </div>
                <p className="text-brand-red font-bold mt-2">
                  {formatPrice(item.price)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity - 1
                        )
                      }
                      className="w-8 h-8 bg-brand-gray-800 hover:bg-brand-gray-700 rounded flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          item.quantity + 1
                        )
                      }
                      className="w-8 h-8 bg-brand-gray-800 hover:bg-brand-gray-700 rounded flex items-center justify-center transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(item.productId, item.size, item.color)
                    }
                    className="p-2 text-brand-gray-400 hover:text-brand-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-brand-gray-400">
                <span>Tạm tính</span>
                <span>{formatPrice(totalPrice())}</span>
              </div>
              <div className="flex justify-between text-brand-gray-400">
                <span>Phí vận chuyển</span>
                <span className="text-success">Miễn phí</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng</span>
                <span className="text-brand-red">
                  {formatPrice(totalPrice())}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="btn-primary w-full mt-6 flex items-center justify-center"
            >
              Thanh toán
            </Link>

            <p className="text-xs text-brand-gray-500 text-center mt-4">
              🔒 Thanh toán an toàn & bảo mật
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
