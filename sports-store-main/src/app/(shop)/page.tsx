"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
} from "lucide-react";
import HeroBanner from "@/components/shop/HeroBanner";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";

const categories = [
  {
    name: "Giày chạy bộ",
    slug: "giay-chay-bo",
    count: 24,
    gradient: "from-red-900/40 to-brand-gray-900",
  },
  {
    name: "Giày bóng đá",
    slug: "giay-bong-da",
    count: 18,
    gradient: "from-orange-900/40 to-brand-gray-900",
  },
  {
    name: "Áo thể thao",
    slug: "ao-the-thao",
    count: 32,
    gradient: "from-blue-900/40 to-brand-gray-900",
  },
  {
    name: "Quần thể thao",
    slug: "quan-the-thao",
    count: 20,
    gradient: "from-green-900/40 to-brand-gray-900",
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien",
    count: 15,
    gradient: "from-purple-900/40 to-brand-gray-900",
  },
];

const features = [
  {
    icon: Truck,
    title: "Giao hàng miễn phí",
    desc: "Cho đơn từ 500K",
  },
  {
    icon: Shield,
    title: "Chính hãng 100%",
    desc: "Cam kết chất lượng",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả 30 ngày",
    desc: "Không điều kiện",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    desc: "Tư vấn tận tâm",
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const res = await fetch("/api/products?isFeatured=true");
        if (res.ok) {
          const data = await res.json();
          // Lấy tối đa 8 sản phẩm nổi bật
          setFeaturedProducts(data.slice(0, 8));
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm nổi bật:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Features Bar */}
      <section className="bg-brand-gray-900 border-y border-brand-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-brand-gray-800 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon size={18} className="text-brand-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-brand-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-brand-red text-sm font-semibold uppercase tracking-wider mb-2">
                Danh mục
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold font-[var(--font-heading)]">
                Khám phá theo danh mục
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm text-brand-gray-400 hover:text-brand-red transition-colors"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`block p-6 rounded-xl bg-gradient-to-br ${cat.gradient} border border-brand-gray-800 hover:border-brand-red/30 transition-all duration-300 group hover:-translate-y-1`}
                >
                  <p className="text-lg font-bold font-[var(--font-heading)] group-hover:text-brand-red transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {cat.count} sản phẩm
                  </p>
                  <ArrowRight
                    size={16}
                    className="mt-4 text-brand-gray-600 group-hover:text-brand-red group-hover:translate-x-1 transition-all"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-20 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-brand-red text-sm font-semibold uppercase tracking-wider mb-2">
                Nổi bật
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold font-[var(--font-heading)]">
                Sản phẩm bán chạy
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm text-brand-gray-400 hover:text-brand-red transition-colors"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-brand-gray-500">
              Không có sản phẩm bán chạy nào.
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-red/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-[var(--font-heading)] leading-tight">
              SẴN SÀNG CHINH PHỤC
              <br />
              <span className="text-brand-red">MỌI THỬ THÁCH?</span>
            </h2>
            <p className="mt-4 text-brand-gray-400 max-w-lg mx-auto">
              Trang bị cho bản thân những sản phẩm tốt nhất để luôn dẫn đầu
              trong mọi cuộc đua.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/products" className="btn-primary flex items-center gap-2">
                Khám phá ngay <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
