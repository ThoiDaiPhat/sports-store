import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Lấy thông tin chi tiết một sản phẩm
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const formattedProduct = {
      ...product,
      sizes: typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes,
      colors: typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors,
      images: typeof product.images === "string" ? JSON.parse(product.images) : product.images,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("❌ Lỗi lấy chi tiết sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể lấy thông tin sản phẩm" },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật thông tin sản phẩm (Chỉ dành cho Admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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
      isActive,
      categoryId,
    } = body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingProduct.name,
        description: description !== undefined ? description : existingProduct.description,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existingProduct.originalPrice,
        stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
        sizes: sizes !== undefined ? (Array.isArray(sizes) ? sizes : []) : (existingProduct.sizes as any),
        colors: colors !== undefined ? (Array.isArray(colors) ? colors : []) : (existingProduct.colors as any),
        images: images !== undefined ? (Array.isArray(images) ? images : []) : (existingProduct.images as any),
        isFeatured: isFeatured !== undefined ? !!isFeatured : existingProduct.isFeatured,
        isActive: isActive !== undefined ? !!isActive : existingProduct.isActive,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("❌ Lỗi cập nhật sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa sản phẩm (Chỉ dành cho Admin)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    // Check auth & role
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    // Kiểm tra xem sản phẩm có tồn tại không
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm" },
        { status: 404 }
      );
    }

    // Xóa sản phẩm
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm" },
      { status: 500 }
    );
  }
}
