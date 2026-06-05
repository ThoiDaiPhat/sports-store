import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Định dạng email không hợp lệ" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được sử dụng" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate 6-digit OTP and expiry (10 minutes)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "USER",
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry,
      },
    });

    // Send verification email
    await sendEmail({
      to: user.email,
      subject: "[SportStore] Mã xác minh tài khoản của bạn",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Xác minh địa chỉ email</h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại SportStore. Để hoàn tất đăng ký, vui lòng sử dụng mã OTP dưới đây để xác minh tài khoản của bạn:</p>
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

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác minh.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
