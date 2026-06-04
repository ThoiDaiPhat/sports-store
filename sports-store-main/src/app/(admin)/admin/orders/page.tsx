"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Trash2, Edit, Search } from "lucide-react";
import Image from "next/image";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "text-yellow-400 bg-yellow-400/10" },
  PROCESSING: { label: "Đang xử lý", color: "text-blue-400 bg-blue-400/10" },
  SHIPPED: { label: "Đang giao", color: "text-purple-400 bg-purple-400/10" },
  DELIVERED: { label: "Đã giao", color: "text-green-400 bg-green-400/10" },
  CANCELLED: { label: "Đã hủy", color: "text-red-400 bg-red-400/10" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công!");
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đơn hàng:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || order.status === statusFilter;
    const matchesPayment = paymentFilter === "ALL" || order.paymentMethod === paymentFilter;

    // Lọc theo ngày đặt hàng
    let matchesDate = true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === "TODAY") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      matchesDate = orderDate >= today;
    } else if (dateFilter === "LAST_7_DAYS") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      matchesDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === "THIS_MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchesDate = orderDate >= startOfMonth;
    } else if (dateFilter === "CUSTOM") {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && orderDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= end;
      }
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl lg:text-3xl font-bold font-[var(--font-heading)]">
          Quản lý đơn hàng
        </h1>
        <p className="text-sm text-brand-gray-400 mt-1">
          Hiển thị {filteredOrders.length} / {orders.length} đơn hàng đã đặt
        </p>
      </motion.div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-12"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả trạng thái</option>
            <option value="PENDING" className="bg-brand-dark">Chờ xử lý (PENDING)</option>
            <option value="PROCESSING" className="bg-brand-dark">Đang xử lý (PROCESSING)</option>
            <option value="SHIPPED" className="bg-brand-dark">Đang giao (SHIPPED)</option>
            <option value="DELIVERED" className="bg-brand-dark">Đã giao (DELIVERED)</option>
            <option value="CANCELLED" className="bg-brand-dark">Đã hủy (CANCELLED)</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả thanh toán</option>
            <option value="COD" className="bg-brand-dark">Thanh toán khi nhận hàng (COD)</option>
            <option value="ONLINE" className="bg-brand-dark">Chuyển khoản (ONLINE)</option>
          </select>
        </div>

        {/* Date Presets Filter */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input"
          >
            <option value="ALL" className="bg-brand-dark">Tất cả thời gian</option>
            <option value="TODAY" className="bg-brand-dark">Hôm nay</option>
            <option value="LAST_7_DAYS" className="bg-brand-dark">7 ngày gần nhất</option>
            <option value="THIS_MONTH" className="bg-brand-dark">Tháng này</option>
            <option value="CUSTOM" className="bg-brand-dark">Tùy chọn ngày...</option>
          </select>
        </div>
      </div>

      {/* Custom Date Inputs (only visible when CUSTOM is selected) */}
      {dateFilter === "CUSTOM" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-6 p-4 bg-brand-gray-900/50 border border-brand-gray-800 rounded-lg max-w-xl"
        >
          <div>
            <label className="block text-xs font-semibold text-brand-gray-400 mb-1.5 uppercase tracking-wider">
              Từ ngày
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brand-gray-400 mb-1.5 uppercase tracking-wider">
              Đến ngày
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input text-sm"
            />
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-brand-gray-500">
                  {orders.length === 0 ? "Chưa có đơn hàng nào được đặt." : "Không tìm thấy đơn hàng nào khớp với bộ lọc."}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-gray-800">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                        Mã đơn
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                        Tổng tiền
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
                    {filteredOrders.map((order, i) => (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`border-b border-brand-gray-800/50 hover:bg-brand-gray-800/30 cursor-pointer transition-colors ${
                          selectedOrder?.id === order.id ? "bg-brand-gray-800/50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-brand-red">
                          {order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium">{order.fullName}</p>
                          <p className="text-xs text-brand-gray-500">{order.phone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              statusMap[order.status]?.color || "text-gray-400 bg-gray-400/10"
                            }`}
                          >
                            {statusMap[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="p-2 text-brand-gray-400 hover:text-white transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>

          {/* Order Detail Sidebar */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-brand-gray-800 pb-4">
                  <h2 className="text-lg font-bold font-[var(--font-heading)]">
                    Chi tiết đơn hàng
                  </h2>
                  <span className="text-xs text-brand-gray-500 font-mono">
                    #{selectedOrder.id.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-brand-gray-500 uppercase tracking-wider block mb-1">
                      Khách hàng
                    </label>
                    <p className="text-sm font-semibold">{selectedOrder.fullName}</p>
                    <p className="text-xs text-brand-gray-400">SĐT: {selectedOrder.phone}</p>
                    <p className="text-xs text-brand-gray-400">Email: {selectedOrder.user?.email}</p>
                  </div>

                  <div>
                    <label className="text-xs text-brand-gray-500 uppercase tracking-wider block mb-1">
                      Địa chỉ nhận hàng
                    </label>
                    <p className="text-sm text-brand-gray-300 leading-relaxed">
                      {selectedOrder.address}
                    </p>
                  </div>

                  {selectedOrder.note && (
                    <div>
                      <label className="text-xs text-brand-gray-500 uppercase tracking-wider block mb-1">
                        Ghi chú
                      </label>
                      <p className="text-xs text-brand-gray-400 italic">
                        "{selectedOrder.note}"
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-brand-gray-500 uppercase tracking-wider block mb-2">
                      Trạng thái đơn hàng
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                      className="form-input text-sm"
                    >
                      <option value="PENDING" className="bg-brand-dark">Chờ xử lý</option>
                      <option value="PROCESSING" className="bg-brand-dark">Đang xử lý</option>
                      <option value="SHIPPED" className="bg-brand-dark">Đang giao</option>
                      <option value="DELIVERED" className="bg-brand-dark">Đã giao</option>
                      <option value="CANCELLED" className="bg-brand-dark">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-brand-gray-800 pt-4">
                  <label className="text-xs text-brand-gray-500 uppercase tracking-wider block mb-3">
                    Sản phẩm đặt mua
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex gap-3 text-sm">
                        <div className="w-12 h-12 bg-brand-gray-800 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                          {item.product.images && item.product.images[0] ? (
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag size={14} className="text-brand-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold text-xs text-brand-gray-200">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-brand-gray-500">
                            Size: {item.size} / Màu: {item.color}
                          </p>
                          <p className="text-xs text-brand-gray-500">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-brand-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-brand-gray-800 pt-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-brand-gray-400">Tổng thanh toán:</span>
                  <span className="text-lg font-bold text-brand-red">
                    {formatPrice(selectedOrder.totalAmount)}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card p-6 text-center text-brand-gray-500 h-64 flex items-center justify-center">
                Chọn một đơn hàng bên trái để xem chi tiết
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
