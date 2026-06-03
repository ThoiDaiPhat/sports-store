"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/types";
import toast from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";

const categoryOptions = [
  { value: "", label: "Tất cả" },
  { value: "giay-chay-bo", label: "Giày chạy bộ" },
  { value: "giay-bong-da", label: "Giày bóng đá" },
  { value: "ao-the-thao", label: "Áo thể thao" },
  { value: "quan-the-thao", label: "Quần thể thao" },
  { value: "phu-kien", label: "Phụ kiện" },
];

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp → cao" },
  { value: "price_desc", label: "Giá cao → thấp" },
];

function ProductsCatalog() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (categoryParam) queryParams.append("category", categoryParam);
      if (searchParam) queryParams.append("search", searchParam);
      if (sortBy) queryParams.append("sort", sortBy);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Không thể tải danh sách sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryParam, searchParam, sortBy]);

  const handleCategoryChange = (catValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catValue) {
      params.set("category", catValue);
    } else {
      params.delete("category");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold font-[var(--font-heading)]">
          {searchParam
            ? `Kết quả tìm kiếm cho "${searchParam}"`
            : categoryParam
            ? categoryOptions.find((c) => c.value === categoryParam)?.label || "Sản phẩm"
            : "Tất cả sản phẩm"}
        </h1>
        <p className="text-brand-gray-400 mt-2">
          {products.length} sản phẩm
        </p>
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        {/* Category Filters — Desktop */}
        <div className="hidden lg:flex gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-4 py-2 text-sm rounded-full border transition-all ${
                categoryParam === cat.value
                  ? "bg-brand-red border-brand-red text-white"
                  : "border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-500 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-brand-gray-700 rounded-lg text-sm text-brand-gray-300 hover:border-brand-gray-500 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Bộ lọc
        </button>

        {/* Sort */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="text-xs text-brand-gray-500">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-gray-900 border border-brand-gray-700 text-sm text-brand-gray-300 rounded-lg px-3 py-2 pr-8 appearance-none cursor-pointer focus:border-brand-red outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gray-500 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="lg:hidden mb-6 overflow-hidden"
        >
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Danh mục</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={16} className="text-brand-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    handleCategoryChange(cat.value);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    categoryParam === cat.value
                      ? "bg-brand-red border-brand-red text-white"
                      : "border-brand-gray-700 text-brand-gray-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-brand-gray-400 text-lg">
            Không tìm thấy sản phẩm nào
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-sm text-brand-red hover:underline"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
