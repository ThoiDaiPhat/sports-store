"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }
    toast.success("Cảm ơn bạn đã đăng ký nhận tin! 🎉");
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-brand-dark border-t border-brand-gray-800">
      {/* Newsletter Section */}
      <div className="bg-brand-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold font-[var(--font-heading)]">
                ĐĂNG KÝ NHẬN TIN
              </h3>
              <p className="text-brand-gray-400 text-sm mt-1">
                Nhận thông tin ưu đãi và sản phẩm mới nhất
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="form-input flex-1 md:w-80"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-red rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight font-[var(--font-heading)]">
                SPORT<span className="text-brand-red">STORE</span>
              </span>
            </div>
            <p className="text-brand-gray-400 text-sm leading-relaxed mb-4">
              Cửa hàng đồ thể thao cao cấp hàng đầu Việt Nam. Chính hãng 100%,
              giao hàng toàn quốc.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-brand-gray-800 hover:bg-brand-red rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              Liên kết
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/products", label: "Tất cả sản phẩm" },
                { href: "/products?category=giay-chay-bo", label: "Giày chạy bộ" },
                { href: "/products?category=ao-the-thao", label: "Áo thể thao" },
                { href: "/products?category=phu-kien", label: "Phụ kiện" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-gray-400 hover:text-brand-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              Hỗ trợ
            </h4>
            <ul className="space-y-2.5">
              {[
                "Hướng dẫn mua hàng",
                "Chính sách đổi trả",
                "Chính sách bảo hành",
                "Câu hỏi thường gặp",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-brand-gray-400 hover:text-brand-red transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">
              Liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-brand-red mt-0.5 shrink-0" />
                <span className="text-sm text-brand-gray-400">
                  123 Nguyễn Huệ, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-red shrink-0" />
                <span className="text-sm text-brand-gray-400">
                  1900 1234
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-red shrink-0" />
                <span className="text-sm text-brand-gray-400">
                  support@sportstore.vn
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brand-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-gray-500">
            <p>© 2024 SportStore. All rights reserved.</p>
            <p>Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
