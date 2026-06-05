"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Đăng ký thất bại");
      } else {
        toast.success("Đăng ký thành công! Vui lòng nhập mã OTP được gửi tới email của bạn.");
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold font-[var(--font-heading)]">
                S
              </span>
            </div>
            <h1 className="text-2xl font-bold font-[var(--font-heading)]">
              Đăng ký tài khoản
            </h1>
            <p className="text-sm text-brand-gray-400 mt-2">
              Tạo tài khoản để mua sắm tại SportStore
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Họ tên
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Tối thiểu 6 ký tự"
                  className="form-input pl-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
                />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Nhập lại mật khẩu"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-brand-gray-700" />
            <span className="text-xs text-brand-gray-500">hoặc</span>
            <div className="flex-1 h-px bg-brand-gray-700" />
          </div>

          <p className="text-center text-sm text-brand-gray-400">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-brand-red hover:text-brand-red-hover font-semibold transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
