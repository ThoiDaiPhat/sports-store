"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Đặt lại mật khẩu thành công!");
      } else {
        toast.error(data.error || "Không thể đặt lại mật khẩu");
      }
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center mx-auto">
          <Lock size={28} className="text-rose-500" />
        </div>
        <h3 className="font-bold text-lg">Liên kết không hợp lệ</h3>
        <p className="text-sm text-brand-gray-400">
          Liên kết đặt lại mật khẩu này không hợp lệ hoặc đã hết hạn.
          Vui lòng yêu cầu một liên kết mới.
        </p>
        <Link
          href="/forgot-password"
          className="btn-primary inline-flex items-center gap-2"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold font-[var(--font-heading)]">
            S
          </span>
        </div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Đặt lại mật khẩu
        </h1>
        <p className="text-sm text-brand-gray-400 mt-2">
          Nhập mật khẩu mới cho tài khoản{" "}
          <span className="text-brand-white font-semibold">{email}</span>
        </p>
      </div>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-brand-gray-300 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
              />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="form-input pl-12 pr-12"
                required
                minLength={6}
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
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500"
              />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="form-input pl-12 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray-500 hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
              "Đặt lại mật khẩu"
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
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Mật khẩu đã được cập nhật!</h3>
            <p className="text-sm text-brand-gray-400 mt-2">
              Mật khẩu của bạn đã được thay đổi thành công.
              Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary inline-flex items-center gap-2"
          >
            Đăng nhập ngay
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense
          fallback={
            <div className="glass-card p-8 text-center">
              <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
