import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Vui lòng nhập mã giảm giá" },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Mã giảm giá không hợp lệ hoặc không tồn tại" },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã tạm ngưng hoạt động" },
        { status: 400 }
      );
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã hết hạn sử dụng" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
    });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mã giảm giá:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi kiểm tra mã" },
      { status: 500 }
    );
  }
}
