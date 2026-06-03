"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  Star,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const addItem = useCartStore((state) => state.addItem);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data);
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }
      } else {
        toast.error("Không tìm thấy sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      toast.error("Đã xảy ra lỗi khi lấy thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá sản phẩm:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Vui lòng chọn size!");
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images && product.images[0] ? product.images[0] : "",
      size: selectedSize || "One Size",
      color: selectedColor || "N/A",
      quantity,
      stock: product.stock,
    });

    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error("Vui lòng nhập bình luận!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setReviewComment("");
        setReviewRating(5);
        toast.success("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Lỗi gửi review:", error);
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-brand-gray-600 mb-4" />
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
            Không tìm thấy sản phẩm
          </h2>
          <Link href="/products" className="btn-primary inline-block mt-4">
            Về trang sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? getDiscountPercentage(product.price, product.originalPrice)
    : 0;

  // Điểm đánh giá trung bình
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 text-sm text-brand-gray-500 mb-8"
      >
        <Link href="/" className="hover:text-white transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={14} />
        <Link href="/products" className="hover:text-white transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight size={14} />
        <span className="text-brand-white truncate">{product.name}</span>
      </motion.nav>

      {/* Main product columns */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        {/* Left — Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Main Image */}
          <div className="aspect-square bg-brand-gray-900 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative border border-brand-gray-800">
            {product.images && product.images[activeImageIndex] ? (
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-32 h-32 mx-auto bg-brand-gray-800 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={48} className="text-brand-gray-600" />
                </div>
                <p className="text-brand-gray-500 text-sm">{product.name}</p>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-20 h-20 rounded-lg bg-brand-gray-900 overflow-hidden border-2 flex items-center justify-center transition-all shrink-0 ${
                    activeImageIndex === i
                      ? "border-brand-red"
                      : "border-brand-gray-800 hover:border-brand-gray-600"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right — Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Category */}
          <p className="text-sm text-brand-red font-semibold uppercase tracking-wider mb-2">
            {product.category?.name || "Thể thao"}
          </p>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold font-[var(--font-heading)] leading-tight">
            {product.name}
          </h1>

          {/* Rating Dynamic Display */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(parseFloat(avgRating)) ? "fill-yellow-400" : "text-brand-gray-600"}
                />
              ))}
            </div>
            <span className="text-sm text-brand-gray-400">
              {avgRating} ({reviews.length} đánh giá thực tế)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-brand-white">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-brand-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="badge-sale">-{discount}%</span>
              </>
            )}
          </div>

          <div className="divider my-6" />

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3">
                Màu sắc:{" "}
                <span className="text-brand-gray-400 font-normal">
                  {selectedColor}
                </span>
              </p>
              <div className="flex gap-3">
                {product.colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                      selectedColor === color
                        ? "border-brand-red bg-brand-red/10 text-brand-red font-semibold"
                        : "border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-500"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">
                  Size:{" "}
                  <span className="text-brand-gray-400 font-normal">
                    {selectedSize || "Chọn size"}
                  </span>
                </p>
                <button className="text-xs text-brand-red hover:underline">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-10 text-sm border rounded-lg transition-all ${
                      selectedSize === size
                        ? "border-brand-red bg-brand-red/10 text-brand-red font-semibold"
                        : "border-brand-gray-700 text-brand-gray-400 hover:border-brand-gray-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">Số lượng</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-brand-gray-800 hover:bg-brand-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 bg-brand-gray-800 hover:bg-brand-gray-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
              <span className="text-sm text-brand-gray-500">
                Còn {product.stock} sản phẩm trong kho
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingBag size={18} />
              {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
            </button>
            <button className="w-12 h-12 border border-brand-gray-700 hover:border-brand-red rounded-lg flex items-center justify-center text-brand-gray-400 hover:text-brand-red transition-all">
              <Heart size={20} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: "Giao hàng miễn phí" },
              { icon: Shield, label: "Chính hãng 100%" },
              { icon: RotateCcw, label: "Đổi trả 30 ngày" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="glass-card-light p-3 text-center">
                <Icon size={18} className="mx-auto text-brand-red mb-1" />
                <p className="text-xs text-brand-gray-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="divider my-6" />

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold font-[var(--font-heading)] mb-3">
              Mô tả sản phẩm
            </h3>
            <div className="text-sm text-brand-gray-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Product Reviews Section */}
      <div className="border-t border-brand-gray-800 pt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Reviews Left: Summary and rating form */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-[var(--font-heading)] mb-2 flex items-center gap-2">
                <MessageSquare className="text-brand-red" size={24} /> Đánh giá sản phẩm
              </h3>
              <p className="text-brand-gray-500 text-sm">Chia sẻ trải nghiệm thực tế của bạn về sản phẩm</p>
            </div>

            {/* General Rating Dashboard card */}
            <div className="glass-card p-6 text-center space-y-3">
              <p className="text-5xl font-extrabold text-brand-white font-[var(--font-heading)]">{avgRating}</p>
              <div className="flex justify-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={star <= Math.round(parseFloat(avgRating)) ? "fill-yellow-400" : "text-brand-gray-700"}
                  />
                ))}
              </div>
              <p className="text-xs text-brand-gray-500">Điểm số trung bình dựa trên {reviews.length} đánh giá thực tế</p>
            </div>

            {/* Write a review box */}
            {session ? (
              <form onSubmit={handleReviewSubmit} className="glass-card p-6 space-y-4">
                <p className="font-semibold text-sm">Viết đánh giá của bạn</p>
                
                {/* Rating selection stars */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-yellow-400 transition-transform hover:scale-110 shrink-0"
                    >
                      <Star
                        size={24}
                        className={star <= reviewRating ? "fill-yellow-400" : "text-brand-gray-700"}
                      />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ nhận xét của bạn về chất liệu, kích cỡ, độ êm của đôi giày..."
                    className="form-input min-h-[100px] text-xs resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50"
                >
                  <Send size={12} /> {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </form>
            ) : (
              <div className="glass-card p-6 text-center">
                <p className="text-xs text-brand-gray-400 mb-4">Bạn cần đăng nhập tài khoản để viết đánh giá cho sản phẩm này.</p>
                <Link href="/login" className="btn-primary py-2 text-xs block text-center font-semibold">
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>

          {/* Reviews Right: List of reviews */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
              Tất cả nhận xét ({reviews.length})
            </h4>

            <AnimatePresence>
              {reviews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 glass-card text-brand-gray-500 text-sm"
                >
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận!
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev, index) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 border border-brand-gray-800/60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-gray-800 flex items-center justify-center text-brand-gray-400 border border-brand-gray-700 shrink-0">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand-white">{rev.user?.name || "Khách hàng"}</p>
                            <div className="flex text-yellow-400 mt-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= rev.rating ? "fill-yellow-400" : "text-brand-gray-700"}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] text-brand-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <p className="text-xs text-brand-gray-400 leading-relaxed mt-4 bg-brand-gray-900/30 p-3 rounded-lg border border-brand-gray-800/20 whitespace-pre-line">
                        {rev.comment}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
