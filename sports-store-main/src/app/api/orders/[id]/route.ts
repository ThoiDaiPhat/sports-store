import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// PATCH: Cập nhật trạng thái đơn hàng (Chỉ dành cho Admin)
export async function PATCH(
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp trạng thái mới" },
        { status: 400 }
      );
    }

    // Kiểm tra đơn hàng có tồn tại không
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("❌ Lỗi cập nhật đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật đơn hàng" },
      { status: 500 }
    );
  }
}
