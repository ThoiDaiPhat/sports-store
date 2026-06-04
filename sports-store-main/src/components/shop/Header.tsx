"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Heart,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);
  const { items: wishlistItems } = useWishlist();
  const { data: session, status } = useSession();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Lỗi fetch search suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/products?category=giay-chay-bo", label: "Giày" },
    { href: "/products?category=ao-the-thao", label: "Áo" },
    { href: "/products?category=phu-kien", label: "Phụ kiện" },
  ];

  return (
    <>
      {/* Top Banner */}
      <div className="bg-brand-red text-white text-center text-xs sm:text-sm py-2 font-medium tracking-wide">
        🔥 MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN HÀNG TỪ 500.000₫ — MÃ: FREESHIP
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-brand-black/95 backdrop-blur-xl shadow-lg shadow-black/20"
            : "bg-brand-black"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-brand-gray-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg font-[var(--font-heading)]">
                  S
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight font-[var(--font-heading)] hidden sm:block">
                SPORT<span className="text-brand-red">STORE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium text-brand-gray-300 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-brand-gray-300 hover:text-white transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex p-2 text-brand-gray-300 hover:text-white transition-colors"
                title="Danh sách yêu thích"
              >
                <Heart size={20} />
                {mounted && wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {wishlistItems.length}
                  </motion.span>
                )}
              </Link>

              {/* User Dropdown / Login */}
              {status === "authenticated" ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="p-2 text-brand-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    title={session?.user?.name || "Tài khoản"}
                  >
                    <User size={20} className="text-brand-red" />
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsUserDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-56 bg-brand-dark border border-brand-gray-800 rounded-lg shadow-xl py-2 z-20"
                        >
                          <div className="px-4 py-2 border-b border-brand-gray-800">
                            <p className="text-xs text-brand-gray-500">Xin chào</p>
                            <p className="text-sm font-semibold truncate text-brand-white">
                              {session?.user?.name}
                            </p>
                          </div>

                          {(session?.user as any)?.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-300 hover:text-white hover:bg-brand-gray-800 transition-colors"
                            >
                              <LayoutDashboard size={14} />
                              Quản lý Dashboard
                            </Link>
                          )}

                          <Link
                            href="/orders"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-300 hover:text-white hover:bg-brand-gray-800 transition-colors"
                          >
                            <ShoppingBag size={14} />
                            Đơn hàng của tôi
                          </Link>

                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              signOut();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-brand-gray-300 hover:text-brand-red hover:bg-brand-gray-800 transition-colors"
                          >
                            <LogOut size={14} />
                            Đăng xuất
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-2 text-brand-gray-300 hover:text-white transition-colors"
                  title="Đăng nhập"
                >
                  <User size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-brand-gray-300 hover:text-white transition-colors"
              >
                <ShoppingBag size={20} />
                {mounted && totalItems() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems()}
                  </motion.span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border-t border-brand-gray-800 relative z-50 bg-brand-black"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                  className="relative"
                >
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="form-input pl-12 pr-4"
                    autoFocus
                  />

                  {/* Autocomplete Search Dropdown */}
                  <AnimatePresence>
                    {searchQuery.trim().length >= 2 && (suggestions.length > 0 || isSearching) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 mt-2 bg-brand-gray-900 border border-brand-gray-800 rounded-lg shadow-xl overflow-hidden z-50 max-h-[350px] overflow-y-auto"
                      >
                        {isSearching ? (
                          <div className="flex items-center justify-center p-4">
                            <div className="w-5 h-5 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="py-2">
                            <p className="px-4 py-1.5 text-[10px] font-bold text-brand-gray-500 uppercase tracking-wider border-b border-brand-gray-800">
                              Sản phẩm gợi ý
                            </p>
                            {suggestions.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  router.push(`/products/${item.id}`);
                                  setIsSearchOpen(false);
                                  setSearchQuery("");
                                  setSuggestions([]);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-dark transition-colors border-b border-brand-gray-800/40 last:border-b-0 text-left group"
                              >
                                <div className="w-10 h-10 bg-brand-dark rounded overflow-hidden shrink-0 border border-brand-gray-800">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-brand-gray-800 flex items-center justify-center">
                                      <ShoppingBag size={14} className="text-brand-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold truncate text-brand-white group-hover:text-brand-red transition-colors">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-brand-gray-500 mt-0.5">
                                    {item.categoryName}
                                  </p>
                                </div>
                                <span className="text-xs font-bold text-brand-red">
                                  {formatPrice(item.price)}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {searchQuery.trim().length >= 2 && !isSearching && suggestions.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-0 right-0 mt-2 bg-brand-gray-900 border border-brand-gray-800 rounded-lg shadow-xl p-4 text-center text-xs text-brand-gray-500 z-50"
                      >
                        Không tìm thấy sản phẩm phù hợp.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-brand-gray-800 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-brand-gray-300 hover:text-white hover:bg-brand-gray-900 rounded-lg transition-all"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
