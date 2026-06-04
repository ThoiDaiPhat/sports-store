import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Security best practice: do not reveal if a user exists or not,
    // but we will still mock success.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Nếu email tồn tại trên hệ thống, một liên kết đặt lại mật khẩu đã được gửi.",
      });
    }

    // Generate token and expiry (1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Send reset password email
    const origin = request.headers.get("origin") || "https://sports-store-three.vercel.app";
    const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: user.email,
      subject: "[SportStore] Yêu cầu đặt lại mật khẩu của bạn",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Đặt lại mật khẩu tài khoản</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SportStore của bạn.</p>
          <p>Vui lòng bấm vào nút bên dưới để tiến hành thiết lập mật khẩu mới (Liên kết này có hiệu lực trong vòng 1 giờ):</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đặt lại mật khẩu</a>
          </div>
          <p>Hoặc bạn có thể sao chép liên kết dưới đây và dán vào trình duyệt:</p>
          <p style="word-break: break-all; color: #888;">${resetLink}</p>
          <p>Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ được giữ nguyên.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Nếu email tồn tại trên hệ thống, một liên kết đặt lại mật khẩu đã được gửi.",
    });
  } catch (error: any) {
    console.error("❌ Lỗi yêu cầu quên mật khẩu:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
