import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const trimmedQuery = query.trim();

    // Query active products matching the search query
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: trimmedQuery } },
          { category: { name: { contains: trimmedQuery } } },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const parsed = products.map((product) => {
      let imagesList: string[] = [];
      try {
        imagesList = typeof product.images === "string"
          ? JSON.parse(product.images)
          : (product.images as any);
      } catch (e) {
        imagesList = [];
      }
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: imagesList[0] || "",
        categoryName: product.category?.name || "Thể thao",
      };
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("❌ Lỗi tìm kiếm gợi ý sản phẩm:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tìm kiếm" },
      { status: 500 }
    );
  }
}
