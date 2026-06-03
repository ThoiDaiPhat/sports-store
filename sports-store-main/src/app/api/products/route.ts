import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// GET: Lấy danh sách sản phẩm với bộ lọc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const isFeatured = searchParams.get("isFeatured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort"); // "price_asc", "price_desc", "newest"

    const where: any = { isActive: true };

    // Lọc theo Category Slug
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // Lọc theo Search
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Lọc theo Nổi bật
    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    // Lọc theo Khoảng giá
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Sắp xếp
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Parse JSON sizes, colors, images
    const parsedProducts = products.map((product) => ({
      ...product,
      sizes: typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes,
      colors: typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors,
      images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
    }));

    return NextResponse.json(parsedProducts);
  } catch (error) {
    console.error("❌ Lỗi lấy sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể tải danh sách sản phẩm" },
      { status: 500 }
    );
  }
}

// POST: Tạo sản phẩm mới (Chỉ dành cho Admin)
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check auth & role
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      originalPrice,
      stock,
      sizes,
      colors,
      images,
      isFeatured,
      categoryId,
    } = body;

    // Validate inputs
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Thiếu thông tin sản phẩm bắt buộc" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Kiểm tra trùng slug
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Sản phẩm với tên này đã tồn tại" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock) || 0,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        images: Array.isArray(images) ? images : [],
        isFeatured: !!isFeatured,
        categoryId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("❌ Lỗi tạo sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể tạo sản phẩm" },
      { status: 500 }
    );
  }
}
