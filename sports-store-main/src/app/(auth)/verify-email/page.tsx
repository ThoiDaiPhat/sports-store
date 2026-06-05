"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus the first input on load
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    // Only allow single digit numbers
    if (value && isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // If current field is empty, clear previous field and focus it
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputsRef.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      toast.error("Vui lòng dán mã OTP gồm 6 chữ số");
      return;
    }

    const digits = pastedData.split("");
    setOtp(digits);
    // Focus the last input box
    inputsRef.current[5]?.focus();
  };

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    const fullOtp = otp.join("");
    if (fullOtp.length === 6 && !isLoading && !isSuccess) {
      handleVerify(fullOtp);
    }
  }, [otp]);

  const handleVerify = async (codeToSend?: string) => {
    const code = codeToSend || otp.join("");
    if (code.length !== 6) {
      toast.error("Vui lòng nhập đầy đủ 6 chữ số");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        toast.success("Xác minh tài khoản thành công!");
      } else {
        toast.error(data.error || "Mã xác minh không hợp lệ");
      }
    } catch {
      toast.error("Lỗi kết nối máy chủ, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Đã gửi mã xác minh mới vào email của bạn.");
        setCountdown(60); // Reset countdown
        setOtp(["", "", "", "", "", ""]); // Clear previous input
        inputsRef.current[0]?.focus(); // Re-focus first
      } else {
        toast.error(data.error || "Không thể gửi lại mã");
      }
    } catch {
      toast.error("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="glass-card p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500/30 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={28} className="text-rose-500" />
        </div>
        <h3 className="font-bold text-lg">Thiếu thông tin email</h3>
        <p className="text-sm text-brand-gray-400">
          Không tìm thấy địa chỉ email cần xác nhận. Vui lòng quay về trang đăng nhập và thử lại.
        </p>
        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2"
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card p-8">
      {/* Logo / Icon */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">
          Xác minh tài khoản
        </h1>
        <p className="text-sm text-brand-gray-400 mt-2">
          Chúng tôi đã gửi mã xác minh gồm 6 số tới: <br />
          <span className="text-brand-white font-semibold">{email}</span>
        </p>
      </div>

      {!isSuccess ? (
        <div className="space-y-6">
          {/* OTP inputs */}
          <div className="flex justify-between gap-2 md:gap-4 my-8" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                disabled={isLoading}
                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-brand-gray-700 bg-brand-gray-900/50 rounded-xl focus:border-brand-red focus:bg-brand-gray-900 outline-none transition-all text-white disabled:opacity-50"
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.some((d) => d === "")}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Xác minh"
            )}
          </button>

          {/* Resend option */}
          <div className="text-center text-sm">
            <span className="text-brand-gray-400">Không nhận được mã? </span>
            {countdown > 0 ? (
              <span className="text-brand-gray-500 font-medium">
                Gửi lại sau {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isResending}
                className="text-brand-red hover:text-brand-red-hover font-semibold transition-colors disabled:opacity-50"
              >
                {isResending ? "Đang gửi..." : "Gửi lại mã"}
              </button>
            )}
          </div>
        </div>
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
            <h3 className="font-bold text-lg">Xác minh thành công!</h3>
            <p className="text-sm text-brand-gray-400 mt-2">
              Tài khoản của bạn đã được xác minh. Bây giờ bạn đã có thể đăng nhập vào hệ thống.
            </p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="btn-primary w-full inline-flex items-center justify-center gap-2"
          >
            Đăng nhập ngay
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <VerifyEmailForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
