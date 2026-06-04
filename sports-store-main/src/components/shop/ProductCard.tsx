"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
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

    const defaultSize = sizes[0] || "M";
    const defaultColor = colors[0] || "Đen";

    const variant = product.variants?.find(
      (v) => v.size === defaultSize && v.color === defaultColor
    );
    const variantId = variant?.id || "";

    addItem({
      productId: product.id,
      variantId,
      name: product.name,
      price: product.price,
      image: images[0] || "/placeholder.jpg",
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      stock: variant?.stock ?? product.stock,
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
              <Image
                src={images[0]}
                alt={product.name}
                width={300}
                height={300}
                priority={index < 4}
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

          </div>
        </div>
      </Link>
    </motion.div>
  );
}
