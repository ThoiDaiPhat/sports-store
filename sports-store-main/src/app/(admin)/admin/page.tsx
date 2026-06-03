"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ xử lý", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  PROCESSING: { label: "Đang xử lý", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  SHIPPED: { label: "Đang giao", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  DELIVERED: { label: "Đã giao", color: "text-green-400 bg-green-400/10 border-green-400/20" },
  CANCELLED: { label: "Đã hủy", color: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const stats = await res.json();
          setData(stats);
        }
      } catch (error) {
        console.error("Lỗi fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { totalRevenue, totalOrders, totalProducts, totalCustomers, weeklyRevenue, recentOrders } = data || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    weeklyRevenue: [],
    recentOrders: [],
  };

  const stats = [
    {
      title: "Doanh thu",
      value: formatPrice(totalRevenue),
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-400/10 border-green-400/20",
    },
    {
      title: "Đơn hàng",
      value: totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-400/10 border-blue-400/20",
    },
    {
      title: "Sản phẩm",
      value: totalProducts.toString(),
      change: "+3 mới",
      icon: Package,
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/20",
    },
    {
      title: "Khách hàng",
      value: totalCustomers.toString(),
      change: "+15.3%",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-400/10 border-purple-400/20",
    },
  ];

  // Sử dụng dữ liệu doanh thu thực tế từ database theo từng ngày
  const chartData = weeklyRevenue && weeklyRevenue.length > 0
    ? weeklyRevenue
    : [
        { label: "Thứ 2", value: 0 },
        { label: "Thứ 3", value: 0 },
        { label: "Thứ 4", value: 0 },
        { label: "Thứ 5", value: 0 },
        { label: "Thứ 6", value: 0 },
        { label: "Thứ 7", value: 0 },
        { label: "Chủ nhật", value: 0 },
      ];

  const maxChartValue = Math.max(...chartData.map((d: any) => d.value));

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold font-[var(--font-heading)] mb-8">
          Dashboard quản trị
        </h1>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between">
              <div
                className={`w-10 h-10 rounded-lg ${stat.bg} border flex items-center justify-center`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                <TrendingUp size={12} />
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold font-[var(--font-heading)] mt-3">
              {stat.value}
            </p>
            <p className="text-sm text-brand-gray-500 mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart & Info Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart (SVG Column Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-heading)]">Xu hướng doanh thu</h2>
              <p className="text-xs text-brand-gray-500 mt-0.5">Biểu đồ doanh thu tuần này</p>
            </div>
            <span className="text-xs text-brand-red bg-brand-red/10 border border-brand-red/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Sparkles size={12} /> Real-time Sync
            </span>
          </div>

          <div className="relative h-64 w-full flex items-end justify-between px-2 pt-6">
            {chartData.map((item: any, i: number) => {
              const heightPercent = maxChartValue > 0 ? (item.value / maxChartValue) * 80 : 0;
              return (
                <div key={item.label} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-brand-gray-900 border border-brand-gray-800 text-[10px] text-white px-2 py-1 rounded -top-2 pointer-events-none font-semibold z-10 whitespace-nowrap">
                    {formatPrice(item.value)}
                  </div>
                  
                  {/* Visual Bar with delay transition */}
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.05 * i, duration: 0.5 }}
                    style={{ originY: 1, height: `${heightPercent}%` }}
                    className="w-7 sm:w-10 bg-gradient-to-t from-brand-red/40 to-brand-red rounded-t hover:scale-x-105 hover:shadow-lg hover:shadow-brand-red/20 transition-all cursor-pointer"
                  />
                  
                  <span className="text-[10px] text-brand-gray-400 mt-2 font-semibold">{item.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dynamic Coupons & Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-1 glass-card p-6 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-lg font-bold font-[var(--font-heading)] mb-4">Hoạt động khuyến mãi</h2>
            
            <div className="space-y-3">
              <div className="p-3 bg-brand-gray-900 border border-brand-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-red">SALEOFF10</p>
                  <p className="text-[10px] text-brand-gray-500 mt-0.5">Giảm 10% đơn hàng</p>
                </div>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Đang chạy</span>
              </div>

              <div className="p-3 bg-brand-gray-900 border border-brand-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-red">FREESHIP</p>
                  <p className="text-[10px] text-brand-gray-500 mt-0.5">Giảm 15% giao hàng nhanh</p>
                </div>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Đang chạy</span>
              </div>

              <div className="p-3 bg-brand-gray-900 border border-brand-gray-800 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-red">WELCOME5</p>
                  <p className="text-[10px] text-brand-gray-500 mt-0.5">Giảm 5% cho thành viên mới</p>
                </div>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Đang chạy</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-3 mt-4 text-[10px] text-brand-gray-500 flex items-start gap-2 leading-relaxed">
            <span className="text-brand-red font-bold uppercase shrink-0 bg-brand-red/10 px-1.5 py-0.5 rounded text-[8px]">PROMO TIP</span>
            Mã giảm giá và đánh giá đã được seed thành công vào hệ thống để bắt đầu tăng tốc độ bán hàng.
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-gray-800">
          <h2 className="text-lg font-bold font-[var(--font-heading)]">
            Đơn hàng gần đây
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm text-brand-red hover:text-brand-red-hover flex items-center gap-1 transition-colors font-semibold"
          >
            Xem tất cả <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-brand-gray-500">
              Không có đơn hàng nào gần đây.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-gray-800">
                  <th className="px-6 py-3 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Mã đơn
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-brand-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any, i: number) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="border-b border-brand-gray-800/50 hover:bg-brand-gray-900/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-brand-red">
                      {order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.fullName}</td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusMap[order.status]?.color || "text-gray-400 bg-gray-400/10 border-gray-500/20"
                        }`}
                      >
                        {statusMap[order.status]?.label || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-brand-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
