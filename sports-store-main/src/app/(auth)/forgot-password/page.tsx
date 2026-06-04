"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
        toast.success("Vui lòng kiểm tra hộp thư email của bạn!");
      } else {
        toast.error(data.error || "Không thể gửi yêu cầu");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
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
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
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
              Quên mật khẩu
            </h1>
            <p className="text-sm text-brand-gray-400 mt-2">
              Nhập địa chỉ email đã đăng ký để nhận liên kết đặt lại mật khẩu
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-brand-gray-300 mb-2">
                  Địa chỉ Email
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

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Gửi liên kết đặt lại
                  </>
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                <Mail size={28} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email đã được gửi!</h3>
                <p className="text-sm text-brand-gray-400 mt-2">
                  Chúng tôi đã gửi một liên kết đặt lại mật khẩu tới{" "}
                  <span className="text-brand-white font-semibold">{email}</span>.
                  Vui lòng kiểm tra hộp thư (bao gồm cả thư rác).
                </p>
              </div>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail("");
                }}
                className="text-sm text-brand-red hover:text-brand-red-hover transition-colors font-semibold"
              >
                Gửi lại với email khác
              </button>
            </motion.div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-gray-400">
              Bạn đã nhớ mật khẩu?{" "}
              <Link
                href="/login"
                className="text-brand-red hover:text-brand-red-hover font-semibold transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
