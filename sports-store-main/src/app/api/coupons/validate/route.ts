import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

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

    // 1. Kiểm tra giá trị đơn hàng tối thiểu
    const subtotalNum = parseFloat(subtotal) || 0;
    if (subtotalNum < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Đơn hàng chưa đạt giá trị tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")}₫ để áp dụng mã này`,
        },
        { status: 400 }
      );
    }

    // 2. Kiểm tra số lượt sử dụng tối đa trên toàn hệ thống
    const usageCount = await prisma.order.count({
      where: { couponCode: coupon.code },
    });

    if (usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã hết lượt sử dụng trên hệ thống" },
        { status: 400 }
      );
    }

    // 3. Tính toán số tiền được giảm thực tế
    let discountAmount = (subtotalNum * coupon.discountPercent) / 100;
    if (coupon.maxDiscountAmount !== null && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: Math.round(discountAmount),
    });
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mã giảm giá:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi kiểm tra mã" },
      { status: 500 }
    );
  }
}
