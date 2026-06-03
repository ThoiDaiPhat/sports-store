import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH: Kích hoạt / Hủy kích hoạt mã giảm giá
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: !!isActive },
    });

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái mã giảm giá:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật mã giảm giá" },
      { status: 500 }
    );
  }
}

// DELETE: Xóa mã giảm giá vĩnh viễn
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Mã giảm giá đã được xóa thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa mã giảm giá:", error);
    return NextResponse.json(
      { error: "Không thể xóa mã giảm giá" },
      { status: 500 }
    );
  }
}
