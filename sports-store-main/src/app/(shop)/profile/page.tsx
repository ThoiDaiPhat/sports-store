"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Lock, Save, ArrowLeft, ShoppingBag, Heart, Shield } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    createdAt: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Lỗi lấy profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
        }),
      });

      if (res.ok) {
        toast.success("Cập nhật thông tin thành công!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể cập nhật thông tin");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const err = await res.json();
        toast.error(err.error || "Không thể đổi mật khẩu");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-brand-gray-400 hover:text-brand-white transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Về trang chủ
        </Link>
        <h1 className="text-3xl font-bold font-[var(--font-heading)]">
          Tài khoản của tôi
        </h1>
        <p className="text-brand-gray-500 text-sm mt-1">
          Quản lý thông tin cá nhân và bảo mật tài khoản
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-6 text-center mb-6">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-red/20">
              <User size={32} className="text-brand-red" />
            </div>
            <h3 className="font-bold text-lg">{profile.name}</h3>
            <p className="text-xs text-brand-gray-500 mt-1">{profile.email}</p>
            {memberSince && (
              <p className="text-[10px] text-brand-gray-600 mt-2 bg-brand-gray-900/50 inline-block px-3 py-1 rounded-full border border-brand-gray-800">
                Thành viên từ {memberSince}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <Link
              href="/orders"
              className="glass-card p-4 flex items-center gap-3 hover:border-brand-red/30 transition-all group"
            >
              <ShoppingBag size={18} className="text-brand-red" />
              <span className="text-sm font-medium group-hover:text-brand-red transition-colors">Đơn hàng của tôi</span>
            </Link>
            <Link
              href="/wishlist"
              className="glass-card p-4 flex items-center gap-3 hover:border-brand-red/30 transition-all group"
            >
              <Heart size={18} className="text-brand-red" />
              <span className="text-sm font-medium group-hover:text-brand-red transition-colors">Sản phẩm yêu thích</span>
            </Link>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-brand-red" />
              <h2 className="text-lg font-bold font-[var(--font-heading)]">
                Thông tin cá nhân
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="form-input pl-12 opacity-60 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-brand-gray-600 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                  Họ tên *
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="form-input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="0901 234 567"
                    className="form-input pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                  Địa chỉ giao hàng mặc định
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-3.5 text-brand-gray-500" />
                  <textarea
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                    className="form-input pl-12 min-h-[80px] resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>

          {/* Change Password */}
          <form onSubmit={handleChangePassword} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-brand-red" />
              <h2 className="text-lg font-bold font-[var(--font-heading)]">
                Đổi mật khẩu
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="form-input pl-12"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      className="form-input pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-gray-400 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-500" />
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Nhập lại mật khẩu mới"
                      className="form-input pl-12"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary mt-6 flex items-center gap-2 disabled:opacity-50"
            >
              <Lock size={16} />
              {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
