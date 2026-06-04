import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Next.js 16 metadata generator for dynamic SEO
interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    return {
      title: "Không tìm thấy sản phẩm | SportStore",
    };
  }

  let imagesList: string[] = [];
  try {
    imagesList = typeof product.images === "string"
      ? JSON.parse(product.images)
      : (product.images as any);
  } catch (e) {
    imagesList = [];
  }

  return {
    title: `${product.name} | SportStore — Đồ Thể Thao Cao Cấp`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | SportStore`,
      description: product.description.substring(0, 160),
      images: imagesList[0] ? [{ url: imagesList[0] }] : [],
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Parse JSON fields from the database columns
  const parsedProduct = {
    ...product,
    sizes: typeof product.sizes === "string"
      ? JSON.parse(product.sizes)
      : (product.sizes as any),
    colors: typeof product.colors === "string"
      ? JSON.parse(product.colors)
      : (product.colors as any),
    images: typeof product.images === "string"
      ? JSON.parse(product.images)
      : (product.images as any),
  };

  return <ProductDetailClient initialProduct={parsedProduct} />;
}
