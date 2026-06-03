import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Lấy danh sách toàn bộ mã giảm giá (Chỉ Admin)
export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("❌ Lỗi lấy mã giảm giá:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách mã giảm giá" },
      { status: 500 }
    );
  }
}

// POST: Tạo mã giảm giá mới (Chỉ Admin)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, discountPercent, expiryDate } = body;

    if (!code || !discountPercent || !expiryDate) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin mã giảm giá" },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();

    // Kiểm tra trùng mã
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: upperCode },
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã tồn tại trên hệ thống" },
        { status: 400 }
      );
    }

    const newCoupon = await prisma.coupon.create({
      data: {
        code: upperCode,
        discountPercent: parseInt(discountPercent),
        expiryDate: new Date(expiryDate),
        isActive: true,
      },
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error("❌ Lỗi tạo mã giảm giá:", error);
    return NextResponse.json(
      { error: "Không thể tạo mã giảm giá mới" },
      { status: 500 }
    );
  }
}
