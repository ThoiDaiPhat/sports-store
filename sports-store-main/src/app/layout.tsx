import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SportStore — Đồ Thể Thao Cao Cấp",
    template: "%s | SportStore",
  },
  description:
    "Cửa hàng trực tuyến bán đồ thể thao cao cấp. Giày chạy bộ, giày bóng đá, áo thể thao, phụ kiện — Chính hãng, giá tốt nhất.",
  keywords: [
    "đồ thể thao",
    "giày chạy bộ",
    "giày bóng đá",
    "áo thể thao",
    "sports store",
    "thời trang thể thao",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="bg-[#fafafa] text-[#09090b] antialiased">
        <SessionProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#ffffff",
                color: "#09090b",
                border: "1px solid #e4e4e7",
                borderRadius: "8px",
                fontSize: "14px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#e11d48",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

