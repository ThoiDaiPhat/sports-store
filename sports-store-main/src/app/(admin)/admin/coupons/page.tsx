"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Ticket, ToggleLeft, ToggleRight, Calendar, Percent, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      } else {
        toast.error("Không thể tải danh sách mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi lấy coupons:", error);
      toast.error("Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !discountPercent || !expiryDate) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const percent = parseInt(discountPercent);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      toast.error("Phần trăm giảm giá phải từ 1% đến 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountPercent: percent,
          expiryDate: new Date(expiryDate).toISOString(),
        }),
      });

      if (res.ok) {
        const newCoupon = await res.json();
        setCoupons([newCoupon, ...coupons]);
        setCode("");
        setDiscountPercent("");
        setExpiryDate("");
        toast.success("Tạo mã giảm giá mới thành công!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể tạo mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi tạo coupon:", error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setCoupons(
          coupons.map((c) => (c.id === id ? { ...c, isActive: !currentStatus } : c))
        );
        toast.success(`Đã ${!currentStatus ? "kích hoạt" : "hủy kích hoạt"} mã giảm giá!`);
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Lỗi toggle active:", error);
      toast.error("Lỗi kết nối");
    }
  };

  const handleDeleteCoupon = async (id: string, codeStr: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${codeStr}" vĩnh viễn?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        toast.success(`Đã xóa thành công mã giảm giá "${codeStr}"!`);
      } else {
        toast.error("Không thể xóa mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi xóa coupon:", error);
      toast.error("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold font-[var(--font-heading)] flex items-center gap-2">
          <Ticket className="text-brand-red" size={28} /> Quản lý Mã giảm giá (Vouchers)
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Tạo mã khuyến mãi động, cấu hình chiết khấu % và thời hạn sử dụng
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Create Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-brand-red" /> Tạo mã giảm giá mới
            </h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-gray-400 mb-2 uppercase tracking-wider">
                  Mã Coupon *
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: SALEOFF20"
                  className="form-input text-xs uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Percent size={12} /> Tỷ lệ giảm giá (%) *
                </label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="Từ 1 đến 100"
                  className="form-input text-xs"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> Ngày hết hạn *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="form-input text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50 mt-2"
              >
                <Plus size={14} /> {isSubmitting ? "Đang tạo..." : "Tạo mã giảm giá"}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right Column: List Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-brand-gray-800">
              <h3 className="text-base font-bold">Danh sách khuyến mãi hiện hành</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-20 text-brand-gray-500 text-sm">
                Chưa có mã giảm giá nào được tạo.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-brand-gray-800 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider bg-brand-gray-900/40">
                      <th className="px-6 py-3">Mã giảm</th>
                      <th className="px-6 py-3">Phần trăm giảm</th>
                      <th className="px-6 py-3">Ngày hết hạn</th>
                      <th className="px-6 py-3">Trạng thái</th>
                      <th className="px-6 py-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {coupons.map((coupon) => {
                        const expired = new Date(coupon.expiryDate) < new Date();
                        const expiryStr = new Date(coupon.expiryDate).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        });

                        return (
                          <motion.tr
                            key={coupon.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b border-brand-gray-800/50 hover:bg-brand-gray-900/30 transition-colors"
                          >
                            <td className="px-6 py-4 font-mono font-bold text-xs text-brand-red">
                              <span className="bg-brand-red/10 px-2.5 py-1 rounded border border-brand-red/20 uppercase">
                                {coupon.code}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold">
                              {coupon.discountPercent}%
                            </td>
                            <td className={`px-6 py-4 text-xs font-medium ${expired ? "text-rose-500 font-bold" : "text-brand-gray-400"}`}>
                              {expiryStr} {expired && "(Hết hạn)"}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                                className={`flex items-center gap-1 text-xs font-semibold transition-all ${
                                  coupon.isActive
                                    ? "text-green-400 hover:text-green-500"
                                    : "text-brand-gray-500 hover:text-brand-gray-400"
                                }`}
                              >
                                {coupon.isActive ? (
                                  <>
                                    <ToggleRight size={22} className="text-green-400" />
                                    <span>Đang chạy</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft size={22} className="text-brand-gray-500" />
                                    <span>Tạm ngưng</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                                className="p-2 text-brand-gray-500 hover:text-brand-red transition-all"
                                title="Xóa mã"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
