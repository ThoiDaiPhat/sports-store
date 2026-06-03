"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import type { Product } from "@/types";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.originalPrice
    ? getDiscountPercentage(product.price, product.originalPrice)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sizes = product.sizes as string[];
    const colors = product.colors as string[];
    const images = product.images as string[];

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || "/placeholder.jpg",
      size: sizes[0] || "M",
      color: colors[0] || "Đen",
      quantity: 1,
      stock: product.stock,
    });

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const images = product.images as string[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div className="product-card bg-brand-gray-900">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-brand-gray-800">
            {/* Product Image */}
            {images && images[0] ? (
              <img
                src={images[0]}
                alt={product.name}
                className="product-image w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="product-image w-full h-full bg-gradient-to-br from-brand-gray-800 to-brand-gray-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-16 h-16 mx-auto bg-brand-gray-600 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag size={24} className="text-brand-gray-400" />
                  </div>
                  <p className="text-xs text-brand-gray-500 line-clamp-2">
                    {product.name}
                  </p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {discount > 0 && (
                <span className="badge-sale">-{discount}%</span>
              )}
              {product.isFeatured && <span className="badge-new">HOT</span>}
            </div>

            {/* Quick Add Button — appears on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleQuickAdd}
                className="w-full bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Thêm vào giỏ
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-brand-gray-500 uppercase tracking-wider mb-1">
              {product.category?.name || "Thể thao"}
            </p>
            <h3 className="font-semibold text-sm text-brand-white group-hover:text-brand-red transition-colors line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-brand-white">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-brand-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Color Dots */}
            <div className="flex gap-1.5 mt-3">
              {(product.colors as string[]).slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-brand-gray-600"
                  style={{
                    backgroundColor:
                      color === "Đen"
                        ? "#1a1a1a"
                        : color === "Trắng"
                        ? "#e8e8e8"
                        : color === "Đỏ"
                        ? "#e11d48"
                        : color === "Xám"
                        ? "#6b6b6b"
                        : color === "Xanh Navy"
                        ? "#1e3a5f"
                        : color === "Xanh"
                        ? "#2563eb"
                        : color === "Cam"
                        ? "#f97316"
                        : "#4a4a4a",
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
