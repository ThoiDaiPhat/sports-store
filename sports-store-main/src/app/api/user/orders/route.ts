import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Parse product images if they are stored as JSON string
    const parsedOrders = orders.map((order) => {
      const parsedItems = order.items.map((item) => {
        if (item.product) {
          let images = item.product.images;
          if (typeof images === "string") {
            try {
              images = JSON.parse(images);
            } catch (e) {
              images = [];
            }
          }
          return {
            ...item,
            product: {
              ...item.product,
              images,
            },
          };
        }
        return item;
      });
      return {
        ...order,
        items: parsedItems,
      };
    });

    return NextResponse.json(parsedOrders);
  } catch (error) {
    console.error("❌ Lỗi lấy lịch sử đơn hàng:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi lấy đơn hàng" },
      { status: 500 }
    );
  }
}
