"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh mục:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(`Đã xóa sản phẩm "${name}"`);
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      toast.error("Đã xảy ra lỗi khi xóa sản phẩm");
    }
  };

  // Filter products on frontend
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || product.categoryId === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "LOW_STOCK") {
      matchesStock = product.stock < 10 && product.stock > 0;
    } else if (stockFilter === "OUT_OF_STOCK") {
      matchesStock = product.stock === 0;
    }

    const matchesActive =
      activeFilter === "ALL" ||
      (activeFilter === "ACTIVE" && product.isActive) ||
      (activeFilter === "INACTIVE" && !product.isActive);

    return matchesSearch && matchesCategory && matchesStock && matchesActive;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold font-[var(--font-heading)]">
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-brand-gray-400 mt-1">
            Hiển thị {filteredProducts.length} / {products.length} sản phẩm
          </p>
        </motion.div>

        <Link
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-12"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-brand-dark">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả trạng thái kho</option>
            <option value="LOW_STOCK" className="bg-brand-dark">Sắp hết hàng (Dưới 10)</option>
            <option value="OUT_OF_STOCK" className="bg-brand-dark">Hết hàng (Bằng 0)</option>
          </select>
        </div>

        {/* Active/Publish Filter */}
        <div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả trạng thái bán</option>
            <option value="ACTIVE" className="bg-brand-dark">Đang bán</option>
            <option value="INACTIVE" className="bg-brand-dark">Đang ẩn</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-brand-gray-500">
                Không tìm thấy sản phẩm nào.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-gray-800">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, i) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-brand-gray-800/50 hover:bg-brand-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-gray-800 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                            {product.images && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs text-brand-gray-500">No img</span>
                            )}
                          </div>
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-gray-400">
                        {product.category?.name || "Chưa phân loại"}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-semibold ${
                            product.stock < 10 ? "text-warning" : "text-success"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            product.isActive
                              ? "text-green-400 bg-green-400/10"
                              : "text-red-400 bg-red-400/10"
                          }`}
                        >
                          {product.isActive ? "Đang bán" : "Ẩn"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="p-2 text-brand-gray-400 hover:text-white transition-colors"
                            title="Xem"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-brand-gray-400 hover:text-blue-400 transition-colors"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-brand-gray-400 hover:text-brand-red transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
