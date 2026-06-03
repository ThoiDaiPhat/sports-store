"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Ticket,
} from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Sản phẩm", icon: Package },
  { href: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: Ticket },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-dark border-r border-brand-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-brand-gray-800">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-sm font-bold font-[var(--font-heading)]">
                ADMIN PANEL
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-brand-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand-red/10 text-brand-red border-l-2 border-brand-red"
                      : "text-brand-gray-400 hover:text-white hover:bg-brand-gray-800"
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="px-4 pb-6 space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-brand-gray-400 hover:text-white hover:bg-brand-gray-800 transition-all"
            >
              <ChevronLeft size={18} />
              Về cửa hàng
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-brand-gray-400 hover:text-brand-red hover:bg-brand-gray-800 transition-all"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-brand-dark border-b border-brand-gray-800 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-brand-gray-400 hover:text-white mr-4"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-sm font-medium text-brand-gray-300">
            Xin chào, <span className="text-white font-semibold">Admin</span>
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
