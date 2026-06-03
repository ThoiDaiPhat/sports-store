import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET: Lấy danh sách đơn hàng (Admin lấy hết, User thường chỉ lấy đơn của họ)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const userRole = (session.user as any)?.role;
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    const where: any = {};

    // Nếu không phải ADMIN, chỉ lấy đơn hàng của chính mình
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Parse product images
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: typeof item.product.images === "string" ? JSON.parse(item.product.images) : item.product.images,
        },
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    );
  }
}

// POST: Tạo đơn hàng mới (Dành cho Checkout)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập trước khi thanh toán" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      address,
      note,
      items,
      totalAmount,
      couponCode,
      discountAmount,
      paymentMethod,
    } = body;

    if (!fullName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Thiếu thông tin đặt hàng bắt buộc" },
        { status: 400 }
      );
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 401 }
      );
    }

    // Sử dụng transaction để tạo order và giảm stock của sản phẩm
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Tạo đơn hàng chính
      const order = await tx.order.create({
        data: {
          userId,
          fullName,
          phone,
          address,
          note: note || "",
          totalAmount: parseFloat(totalAmount),
          couponCode: couponCode || null,
          discountAmount: discountAmount ? parseFloat(discountAmount) : 0,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "UNPAID",
        },
      });

      // 2. Tạo các chi tiết đơn hàng (OrderItem) và cập nhật số lượng tồn kho (stock)
      for (const item of items) {
        const { productId, quantity, price, size, color } = item;

        // Kiểm tra tồn kho
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new Error(`Sản phẩm với ID ${productId} không tồn tại`);
        }

        if (product.stock < quantity) {
          throw new Error(`Sản phẩm "${product.name}" đã hết hàng hoặc không đủ số lượng trong kho`);
        }

        // Tạo OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId,
            quantity,
            price: parseFloat(price),
            size,
            color,
          },
        });

        // Giảm stock của sản phẩm
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: error.message || "Không thể tạo đơn hàng" },
      { status: 500 }
    );
  }
}
