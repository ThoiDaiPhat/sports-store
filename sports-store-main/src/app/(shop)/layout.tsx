import Header from "@/components/shop/Header";
import Footer from "@/components/shop/Footer";
import SupportWidget from "@/components/shop/SupportWidget";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportWidget />
    </div>
  );
}
