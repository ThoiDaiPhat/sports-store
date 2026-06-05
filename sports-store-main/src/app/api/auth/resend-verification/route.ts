import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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

    // Generate new 6-digit OTP and expiry (10 minutes)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "[SportStore] Mã xác minh tài khoản mới của bạn",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Gửi lại mã xác minh</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu gửi lại mã xác minh cho tài khoản SportStore của bạn.</p>
          <p>Vui lòng sử dụng mã OTP dưới đây để xác minh tài khoản:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ef4444; border: 1px dashed #ef4444; padding: 10px 20px; border-radius: 6px; display: inline-block; background-color: #fef2f2;">${verificationToken}</span>
          </div>
          <p>Mã xác minh này có hiệu lực trong vòng <strong>10 phút</strong>. Tuyệt đối không chia sẻ mã này với bất kỳ ai để bảo mật tài khoản.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Gửi lại mã xác minh thành công! Vui lòng kiểm tra email của bạn.",
    });
  } catch (error) {
    console.error("❌ Lỗi gửi lại mã xác minh:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}
