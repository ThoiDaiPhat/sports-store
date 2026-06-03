"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-brand-black">
      {/* Background Gradient Decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-red/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-red/10 border border-brand-red/20 rounded-full mb-6"
            >
              <Zap size={14} className="text-brand-red" />
              <span className="text-sm font-medium text-brand-red">
                Bộ sưu tập mới 2024
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight font-[var(--font-heading)]"
            >
              NÂNG TẦM
              <br />
              <span className="text-brand-red">PHONG CÁCH</span>
              <br />
              THỂ THAO
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-brand-gray-400 max-w-lg leading-relaxed"
            >
              Khám phá bộ sưu tập đồ thể thao cao cấp, được thiết kế cho những
              người không ngừng vượt qua giới hạn.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/products" className="btn-primary flex items-center gap-2 group">
                Mua ngay
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link href="/products?featured=true" className="btn-secondary">
                Xem nổi bật
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex gap-8 sm:gap-12"
            >
              {[
                { value: "500+", label: "Sản phẩm" },
                { value: "10K+", label: "Khách hàng" },
                { value: "4.9★", label: "Đánh giá" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold font-[var(--font-heading)]">
                    {stat.value}
                  </p>
                  <p className="text-sm text-brand-gray-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Decorative Hero Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* Large Circle Background */}
            <div className="absolute w-[500px] h-[500px] rounded-full border border-brand-gray-800/50" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-brand-gray-800/30" />
            <div className="absolute w-[300px] h-[300px] rounded-full bg-brand-red/5" />

            {/* Central Text Element */}
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-48 h-48 mx-auto relative"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    id="circlePath"
                    d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
                    fill="none"
                  />
                  <text className="fill-brand-gray-500 text-[11px] uppercase tracking-[0.3em]">
                    <textPath href="#circlePath">
                      SPORT STORE • PREMIUM QUALITY • SINCE 2024 •{" "}
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold font-[var(--font-heading)]">
                      S
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-brand-gray-500 text-sm uppercase tracking-[0.2em]"
              >
                Just Do It Better
              </motion.p>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-10 right-10 glass-card-light px-4 py-3"
            >
              <p className="text-xs text-brand-gray-400">Giảm đến</p>
              <p className="text-xl font-bold text-brand-red">40%</p>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-20 left-0 glass-card-light px-4 py-3"
            >
              <p className="text-xs text-brand-gray-400">Miễn phí ship</p>
              <p className="text-sm font-bold">Toàn quốc</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
