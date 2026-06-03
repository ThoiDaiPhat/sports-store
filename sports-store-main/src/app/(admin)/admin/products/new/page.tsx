"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44"];
const AVAILABLE_COLORS = ["Đen", "Trắng", "Đỏ", "Xám", "Xanh Navy", "Vàng", "Cam"];

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, data.url]);
        toast.success("Upload ảnh thành công!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Lỗi upload ảnh");
      }
    } catch (error) {
      console.error("Lỗi upload file:", error);
      toast.error("Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !stock || !categoryId) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          stock: parseInt(stock),
          sizes: selectedSizes,
          colors: selectedColors,
          images,
          isFeatured,
          categoryId,
        }),
      });

      if (res.ok) {
        toast.success("Thêm sản phẩm thành công!");
        router.push("/admin/products");
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể tạo sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi submit form:", error);
      toast.error("Đã xảy ra lỗi khi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Quay lại danh sách sản phẩm
      </Link>

      <h1 className="text-2xl lg:text-3xl font-bold font-[var(--font-heading)] mb-8">
        Thêm sản phẩm mới
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold font-[var(--font-heading)] border-b border-brand-gray-800 pb-2">
                Thông tin cơ bản
              </h2>

              <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Giày Nike Air Max 2026"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                  Mô tả chi tiết *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả chất liệu, thiết kế, công nghệ..."
                  className="form-input min-h-[160px] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Giá bán (VND) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2890000"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Giá gốc (Nếu có)
                  </label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="3490000"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Số lượng trong kho *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="50"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Danh mục *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="form-input"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-brand-dark text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes & Colors */}
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-bold font-[var(--font-heading)] border-b border-brand-gray-800 pb-2">
                Biến thể (Size & Màu sắc)
              </h2>

              <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-3">
                  Chọn kích thước (Sizes)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`w-12 h-10 border rounded-lg text-sm transition-all ${
                          isSelected
                            ? "border-brand-red bg-brand-red/10 text-brand-red font-semibold"
                            : "border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-500"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-3">
                  Chọn màu sắc (Colors)
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleColorToggle(color)}
                        className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                          isSelected
                            ? "border-brand-red bg-brand-red/10 text-brand-red font-semibold"
                            : "border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-500"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Images Upload */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold font-[var(--font-heading)] border-b border-brand-gray-800 pb-2">
                Hình ảnh sản phẩm
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square bg-brand-gray-900 rounded-lg overflow-hidden border border-brand-gray-800 group">
                    <img src={img} alt="Product" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-brand-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                  <label className="relative aspect-square bg-brand-gray-900 hover:bg-brand-gray-800/80 border-2 border-dashed border-brand-gray-700 hover:border-brand-gray-500 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-all">
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload size={20} className="text-brand-gray-500 mb-1" />
                        <span className="text-xs text-brand-gray-500">Tải ảnh lên</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-brand-gray-500">
                Chấp nhận định dạng ảnh JPG, PNG, WEBP tối đa 5MB. Tối đa 6 hình ảnh.
              </p>
            </div>

            {/* Publish Settings */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-bold font-[var(--font-heading)] border-b border-brand-gray-800 pb-2">
                Thiết lập hiển thị
              </h2>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Sản phẩm nổi bật</p>
                  <p className="text-xs text-brand-gray-500">Hiển thị ở trang chủ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-brand-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  Lưu sản phẩm
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
