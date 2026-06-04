"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} className="text-brand-red" />
        </div>

        <h2 className="text-2xl font-bold font-[var(--font-heading)] mb-2">
          Đã xảy ra lỗi
        </h2>
        <p className="text-brand-gray-500 text-sm leading-relaxed mb-6">
          Rất tiếc, đã có sự cố xảy ra khi tải trang. Vui lòng thử lại hoặc
          quay về trang chủ.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
          <Link
            href="/"
            className="btn-secondary flex items-center gap-2"
          >
            <Home size={16} />
            Trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
