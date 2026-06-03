"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, Calendar, ShieldCheck, MapPin, Truck, CheckCircle2, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  product?: {
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  fullName: string;
  phone: string;
  address: string;
  note: string | null;
  couponCode: string | null;
  discountAmount: number | null;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig = {
  PENDING: { label: "Chờ xử lý", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
  PROCESSING: { label: "Đang xử lý", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  SHIPPED: { label: "Đang giao hàng", color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  DELIVERED: { label: "Đã giao hàng", color: "text-green-500 bg-green-500/10 border-green-500/30" },
  CANCELLED: { label: "Đã hủy", color: "text-rose-500 bg-rose-500/10 border-rose-500/30" },
};

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        toast.error("Không thể tải lịch sử đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      toast.error("Lỗi kết nối cơ sở dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </Link>
        <h1 className="text-3xl font-bold font-[var(--font-heading)]">
          Đơn hàng của bạn
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Quản lý và tra cứu trạng thái giao hàng thực tế
        </p>
      </div>

      <AnimatePresence>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 glass-card"
          >
            <ShoppingBag size={48} className="mx-auto text-brand-gray-600 mb-4" />
            <h3 className="font-bold text-lg mb-1">Chưa có đơn hàng nào</h3>
            <p className="text-brand-gray-500 text-sm mb-6">
              Bạn chưa thực hiện bất kỳ giao dịch mua hàng nào tại cửa hàng.
            </p>
            <Link href="/products" className="btn-primary inline-flex items-center gap-2">
              Mua sắm ngay
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const status = statusConfig[order.status];
              const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden"
                >
                  {/* Order Top Summary */}
                  <div className="p-6 border-b border-brand-gray-800 bg-brand-dark/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-gray-900 flex items-center justify-center text-brand-gray-400 border border-brand-gray-800">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-brand-gray-500">Mã đơn: #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-semibold mt-0.5">{orderDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-xs text-brand-gray-500 bg-brand-gray-900 border border-brand-gray-800 px-2.5 py-1 rounded-full">
                        {order.paymentMethod === "ONLINE" ? "Đã CK Online" : "COD"}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-brand-gray-800/50 px-6">
                    {order.items.map((item) => {
                      const image = item.product?.images && item.product.images[0] ? item.product.images[0] : "";
                      return (
                        <div key={item.id} className="py-4 flex gap-4 items-center">
                          <div className="w-16 h-16 bg-brand-gray-900 rounded-lg overflow-hidden border border-brand-gray-800 flex items-center justify-center shrink-0">
                            {image ? (
                              <img src={image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={20} className="text-brand-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.product?.name}</h4>
                            <p className="text-xs text-brand-gray-500 mt-0.5">
                              Size: {item.size} / Màu: {item.color} / SL: {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Tracking Timeline */}
                  {order.status !== "CANCELLED" && (
                    <div className="px-6 py-5 border-t border-brand-gray-800/30 bg-brand-gray-900/10">
                      <p className="text-xs font-semibold uppercase text-brand-gray-500 mb-4 tracking-wider">
                        Trạng thái vận chuyển
                      </p>
                      <div className="flex justify-between items-center relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-brand-gray-800 -z-10" />
                        <div
                          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-brand-red transition-all duration-500 -z-10"
                          style={{
                            width:
                              order.status === "PENDING"
                                ? "0%"
                                : order.status === "PROCESSING"
                                ? "33%"
                                : order.status === "SHIPPED"
                                ? "66%"
                                : "100%",
                          }}
                        />

                        {/* Step 1: PENDING */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              order.status === "PENDING" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED"
                                ? "bg-brand-red border-brand-red text-white"
                                : "bg-brand-gray-900 border-brand-gray-800 text-brand-gray-500"
                            }`}
                          >
                            <ShieldCheck size={14} />
                          </div>
                          <span className="text-[10px] mt-1.5 font-semibold text-brand-gray-400">Đã đặt</span>
                        </div>

                        {/* Step 2: PROCESSING */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED"
                                ? "bg-brand-red border-brand-red text-white"
                                : "bg-brand-gray-900 border-brand-gray-800 text-brand-gray-500"
                            }`}
                          >
                            <MapPin size={14} />
                          </div>
                          <span className="text-[10px] mt-1.5 font-semibold text-brand-gray-400">Đóng gói</span>
                        </div>

                        {/* Step 3: SHIPPED */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              order.status === "SHIPPED" || order.status === "DELIVERED"
                                ? "bg-brand-red border-brand-red text-white"
                                : "bg-brand-gray-900 border-brand-gray-800 text-brand-gray-500"
                            }`}
                          >
                            <Truck size={14} />
                          </div>
                          <span className="text-[10px] mt-1.5 font-semibold text-brand-gray-400">Đang giao</span>
                        </div>

                        {/* Step 4: DELIVERED */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                              order.status === "DELIVERED"
                                ? "bg-brand-red border-brand-red text-white"
                                : "bg-brand-gray-900 border-brand-gray-800 text-brand-gray-500"
                            }`}
                          >
                            <CheckCircle2 size={14} />
                          </div>
                          <span className="text-[10px] mt-1.5 font-semibold text-brand-gray-400">Hoàn thành</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Step */}
                  {order.status === "CANCELLED" && (
                    <div className="px-6 py-3 bg-rose-500/5 text-rose-500 text-xs font-semibold flex items-center gap-2 border-t border-brand-gray-800/30">
                      <XCircle size={14} /> Đơn hàng này đã bị hủy bỏ trên hệ thống. Số tiền hoàn trả sẽ được xử lý nếu có.
                    </div>
                  )}

                  {/* Pricing Summary */}
                  <div className="p-6 bg-brand-dark/30 border-t border-brand-gray-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="text-xs text-brand-gray-400 space-y-1">
                      {order.couponCode && (
                        <p>
                          Áp dụng mã: <span className="text-brand-red font-semibold">{order.couponCode}</span> (-{formatPrice(order.discountAmount || 0)})
                        </p>
                      )}
                      <p>Người nhận: {order.fullName} - {order.phone}</p>
                      <p className="truncate max-w-[300px]">Đ/C: {order.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-gray-500">Tổng thanh toán</p>
                      <p className="text-lg font-bold text-brand-red">{formatPrice(order.totalAmount)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
