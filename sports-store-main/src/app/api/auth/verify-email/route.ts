import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Thiếu email hoặc mã xác minh" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Tài khoản đã được xác minh trước đó.",
      });
    }

    // Verify token matching and expiry
    if (user.verificationToken !== code) {
      return NextResponse.json(
        { error: "Mã xác minh không chính xác" },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới." },
        { status: 400 }
      );
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Xác minh tài khoản thành công! Bạn có thể đăng nhập.",
    });
  } catch (error) {
    console.error("❌ Lỗi xác minh email:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
