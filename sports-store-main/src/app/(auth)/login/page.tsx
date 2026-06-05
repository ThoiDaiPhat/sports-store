"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          toast.error("Tài khoản chưa xác minh email. Đang chuyển hướng đến trang xác minh...");
          setTimeout(() => {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }, 1500);
        } else {
          toast.error(result.error);
        }
      } else {
        toast.success("Đăng nhập thành công!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-brand-red/3 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold font-[var(--font-heading)]">
                S
              </span>
            </div>
            <h1 className="text-2xl font-bold font-[var(--font-heading)]">
              Đăng nhập
            </h1>
            <p className="text-sm text-brand-gray-400 mt-2">
              Chào mừng bạn quay lại SportStore
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-brand-red hover:text-brand-red-hover transition-colors font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-brand-gray-700" />
            <span className="text-xs text-brand-gray-500">hoặc</span>
            <div className="flex-1 h-px bg-brand-gray-700" />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-brand-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-brand-red hover:text-brand-red-hover font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 bg-brand-gray-900/50 rounded-lg">
            <p className="text-xs text-brand-gray-500 font-semibold uppercase tracking-wider mb-2">
              Tài khoản demo
            </p>
            <div className="space-y-1 text-xs text-brand-gray-400">
              <p>
                Admin: <span className="text-brand-white">admin@sportstore.com</span> / admin123
              </p>
              <p>
                User: <span className="text-brand-white">user@sportstore.com</span> / user123
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
