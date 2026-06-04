"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, CheckCircle, LogIn, Sparkles, X, QrCode, Landmark, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, totalPrice, clearCart } = useCartStore();

  const bankId = process.env.NEXT_PUBLIC_BANK_ID || "VCB";
  const bankAccount = process.env.NEXT_PUBLIC_BANK_ACCOUNT || "1029384756";
  const bankName = process.env.NEXT_PUBLIC_BANK_NAME || "SPORTSTORE VIETNAM";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [isVerifyingCoupon, setIsVerifyingCoupon] = useState(false);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrTimer, setQrTimer] = useState(299); // 5 phút

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Nếu chưa đăng nhập, bắt buộc đăng nhập để mua hàng
  if (status === "unauthenticated") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <LogIn size={48} className="mx-auto text-brand-red mb-4 animate-bounce" />
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-brand-gray-400 text-sm mb-6">
            Bạn cần đăng nhập tài khoản để thực hiện thanh toán đơn hàng này.
          </p>
          <div className="space-y-3">
            <Link
              href={`/login?callbackUrl=/checkout`}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn size={16} />
              Đăng nhập ngay
            </Link>
            <Link
              href="/register"
              className="btn-secondary w-full block text-center"
            >
              Tạo tài khoản mới
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-brand-gray-600 mb-4" />
          <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
            Giỏ hàng trống
          </h2>
          <Link href="/products" className="btn-primary inline-block mt-4">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6"
        >
          <CheckCircle size={80} className="mx-auto text-success mb-6" />
          <h2 className="text-3xl font-bold font-[var(--font-heading)] mb-2">
            Đặt hàng thành công! 🎉
          </h2>
          <p className="text-brand-gray-400 max-w-md mx-auto mt-2 text-sm leading-relaxed">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận trên hệ thống. 
            Bạn có thể kiểm tra tiến trình giao hàng tại mục **Đơn hàng của tôi**.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/orders" className="btn-primary flex items-center gap-2">
              <ShoppingBag size={16} /> Theo dõi đơn hàng
            </Link>
            <Link href="/" className="btn-secondary">
              Về trang chủ
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Tính toán số tiền
  const subtotal = totalPrice();
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalTotal = subtotal - discountAmount;

  // Xử lý mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsVerifyingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
        toast.success(`Áp dụng thành công mã "${data.code}" giảm ${data.discountPercent}%!`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi áp mã giảm giá:", error);
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setIsVerifyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.success("Đã gỡ bỏ mã giảm giá");
  };

  // Submit Order Logic
  const executeOrderSubmission = async (overridePaymentStatus = "UNPAID") => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          note: formData.note,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          totalAmount: finalTotal,
          couponCode: appliedCoupon?.code || null,
          discountAmount: discountAmount,
          paymentMethod: paymentMethod,
        }),
      });

      if (res.ok) {
        clearCart();
        setIsQRModalOpen(false);
        setIsSuccess(true);
        toast.success("Đơn hàng của bạn đã được đặt thành công!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể đặt hàng. Vui lòng kiểm tra lại.");
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      toast.error("Đã xảy ra lỗi kết nối");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    if (paymentMethod === "ONLINE") {
      // Mở cổng thanh toán Online QR Pay giả lập trước
      setIsQRModalOpen(true);
      setQrTimer(299); // Reset 5 phút
    } else {
      // COD thanh toán khi nhận hàng -> Đặt luôn
      executeOrderSubmission("UNPAID");
    }
  };

  // Format giây đếm ngược
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Tạo QR Code SVG giả lập đẹp mắt cho SportStore
  const renderSimulatedQR = () => {
    return (
      <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="8" fill="white" />
        {/* Border outline red */}
        <rect x="3" y="3" width="94" height="94" rx="6" stroke="#e11d48" strokeWidth="2.5" />
        {/* Core elements of a QR */}
        <rect x="8" y="8" width="22" height="22" rx="2" fill="#09090b" stroke="#e11d48" strokeWidth="2" />
        <rect x="13" y="13" width="12" height="12" rx="1" fill="#09090b" />
        <rect x="70" y="8" width="22" height="22" rx="2" fill="#09090b" stroke="#e11d48" strokeWidth="2" />
        <rect x="75" y="13" width="12" height="12" rx="1" fill="#09090b" />
        <rect x="8" y="70" width="22" height="22" rx="2" fill="#09090b" stroke="#e11d48" strokeWidth="2" />
        <rect x="13" y="75" width="12" height="12" rx="1" fill="#09090b" />
        {/* Small details */}
        <rect x="70" y="70" width="8" height="8" fill="#e11d48" />
        <rect x="84" y="84" width="8" height="8" fill="#09090b" />
        {/* Random dots to simulate a QR Code */}
        <path d="M38 12h8v4h-8zM42 22h12v4h-12zM38 32h4v8h-4zM54 10h8v4h-8zM60 26h8v4h-8zM48 48h16v4h-16zM32 54h8v8h-8zM56 56h12v8h-12zM76 40h12v4h-12zM12 38h4v16h-4zM24 48h8v4h-8zM80 50h8v4h-8z" fill="#09090b" />
        {/* Center SportStore Logo indicator */}
        <rect x="42" y="42" width="16" height="16" rx="2" fill="#e11d48" />
        <text x="50" y="53" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">S</text>
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Quay lại giỏ hàng
      </Link>

      <h1 className="text-3xl font-bold font-[var(--font-heading)] mb-8">
        Thanh toán
      </h1>

      <form onSubmit={handleCheckoutSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={20} className="text-brand-red" />
                <h2 className="text-lg font-bold font-[var(--font-heading)]">
                  Thông tin giao hàng
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Họ tên *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Nguyễn Văn A"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="0901 234 567"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                  Địa chỉ giao hàng *
                  <span className="text-xs text-brand-gray-500 font-normal ml-1">
                    (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/TP)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                  className="form-input"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Ghi chú thêm cho người giao hàng (tùy chọn)"
                  className="form-input min-h-[80px] resize-none"
                />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={20} className="text-brand-red" />
                <h2 className="text-lg font-bold font-[var(--font-heading)]">
                  Phương thức thanh toán
                </h2>
              </div>
              
              <div className="space-y-3">
                {/* Option 1: COD */}
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-brand-red bg-brand-red/5"
                    : "border-brand-gray-800 hover:border-brand-gray-700 bg-brand-gray-900/10"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "COD" ? "border-brand-red" : "border-brand-gray-600"
                    }`}>
                      {paymentMethod === "COD" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Thanh toán khi nhận hàng (COD)
                      </p>
                      <p className="text-xs text-brand-gray-400 mt-0.5">
                        Thanh toán bằng tiền mặt khi nhận hàng thành công
                      </p>
                    </div>
                  </div>
                </label>

                {/* Option 2: ONLINE */}
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === "ONLINE"
                    ? "border-brand-red bg-brand-red/5"
                    : "border-brand-gray-800 hover:border-brand-gray-700 bg-brand-gray-900/10"
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={paymentMethod === "ONLINE"}
                      onChange={() => setPaymentMethod("ONLINE")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "ONLINE" ? "border-brand-red" : "border-brand-gray-600"
                    }`}>
                      {paymentMethod === "ONLINE" && <div className="w-2 h-2 rounded-full bg-brand-red" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        Chuyển khoản trực tuyến & Quét mã QR Pay
                      </p>
                      <p className="text-xs text-brand-gray-400 mt-0.5">
                        Tự động khởi tạo QR Code thanh toán online an toàn 24/7
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">
                Đơn hàng ({items.length} sản phẩm)
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3 text-sm"
                  >
                    <div className="w-12 h-12 bg-brand-gray-900 rounded-lg shrink-0 overflow-hidden flex items-center justify-center border border-brand-gray-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag size={14} className="text-brand-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">
                        {item.name}
                      </p>
                      <p className="text-xs text-brand-gray-500">
                        {item.size} / {item.color} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-semibold whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="divider my-4" />

              {/* Promo Coupon Form */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-brand-gray-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-brand-red" /> Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Mã: SALEOFF10, FREESHIP"
                    className="form-input py-2 text-xs uppercase"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 bg-brand-gray-800 hover:bg-rose-500/10 hover:text-rose-500 rounded text-xs transition-colors shrink-0"
                    >
                      Xóa
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isVerifyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-brand-red hover:bg-brand-red-hover text-white rounded text-xs font-semibold disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isVerifyingCoupon ? "..." : "Áp dụng"}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-brand-gray-400">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-brand-red">
                    <span>Mã giảm ({appliedCoupon.code} -{appliedCoupon.discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-gray-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-success">Miễn phí</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-brand-red">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full mt-6 flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : paymentMethod === "ONLINE" ? (
                  "Quét mã QR thanh toán"
                ) : (
                  "Đặt hàng"
                )}
              </button>

              <p className="text-xs text-brand-gray-500 text-center mt-3">
                🔒 Thanh toán bảo mật tuyệt đối 24/7
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Dynamic simulated QR pay modal */}
      <AnimatePresence>
        {isQRModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsQRModalOpen(false)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-brand-dark border border-brand-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl relative max-w-md w-full z-10 overflow-hidden"
            >
              <button
                onClick={() => setIsQRModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-gray-800 text-brand-gray-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>

              <div className="text-center">
                <QrCode size={36} className="text-brand-red mx-auto mb-2 animate-pulse" />
                <h3 className="text-xl font-bold font-[var(--font-heading)]">Thanh toán Online</h3>
                <p className="text-brand-gray-500 text-xs mt-1">Quét mã QR Pay phía dưới để hoàn tất đơn hàng</p>

                {/* Real Dynamic VietQR Code */}
                <div className="my-6 p-3 bg-white rounded-lg inline-block shadow-inner relative group border border-brand-gray-200">
                  <Image
                    src={`https://img.vietqr.io/image/${bankId}-${bankAccount}-compact2.png?amount=${finalTotal}&addInfo=SPORTSTORE%20PAY&accountName=${encodeURIComponent(bankName)}`}
                    alt="VietQR Code"
                    width={192}
                    height={192}
                    className="w-48 h-48 mx-auto object-contain"
                  />
                </div>

                {/* Bank details */}
                <div className="text-left bg-brand-gray-900 border border-brand-gray-800 p-4 rounded-lg text-xs space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-brand-red font-semibold mb-1">
                    <Landmark size={14} /> Ngân hàng chuyển khoản
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Ngân hàng:</span>
                    <span className="font-semibold">{bankId === "VCB" ? "VIETCOMBANK (Quốc dân)" : bankId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Số tài khoản:</span>
                    <span className="font-bold tracking-wider text-brand-white">{bankAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Tên người nhận:</span>
                    <span className="font-semibold">{bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Số tiền:</span>
                    <span className="font-bold text-brand-red text-sm">{formatPrice(finalTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-500">Nội dung chuyển khoản:</span>
                    <span className="font-semibold text-brand-red">SPORTSTORE PAY</span>
                  </div>
                </div>

                {/* Actions inside modal */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => executeOrderSubmission("PAID")}
                    className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <CheckCircle size={16} /> Tôi đã chuyển khoản thành công
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQRModalOpen(false)}
                    className="w-full text-xs text-brand-gray-400 hover:text-brand-red hover:underline py-1.5 transition-colors"
                  >
                    Hủy bỏ giao dịch
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
