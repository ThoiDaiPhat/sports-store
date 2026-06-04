"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { Product } from "@/types";

interface RelatedProductsProps {
  categoryId: string;
  categorySlug?: string;
  currentProductId: string;
}

export default function RelatedProducts({
  categoryId,
  categorySlug,
  currentProductId,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!categorySlug) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/products?category=${categorySlug}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out current product and limit to 4
          const filtered = data
            .filter((p: Product) => p.id !== currentProductId)
            .slice(0, 4);
          setProducts(filtered);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [categorySlug, currentProductId]);

  if (loading) {
    return (
      <div className="py-12 border-t border-brand-gray-800 mt-16">
        <h3 className="text-xl font-bold font-[var(--font-heading)] mb-8">
          Sản phẩm liên quan
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-square bg-brand-gray-900 rounded-lg" />
              <div className="h-4 bg-brand-gray-900 rounded w-2/3" />
              <div className="h-4 bg-brand-gray-900 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-brand-gray-800 mt-16">
      <h3 className="text-2xl font-bold font-[var(--font-heading)] mb-8 text-brand-white">
        Sản phẩm liên quan
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
