import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Thiếu thông tin mã đơn hàng" },
        { status: 400 }
      );
    }

    // 1. Tìm đơn hàng
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng trên hệ thống" },
        { status: 404 }
      );
    }

    // 2. Kiểm tra nếu đơn hàng đã được xử lý hoặc thanh toán rồi
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Đơn hàng này đã được xác nhận thanh toán trước đó",
      });
    }

    // 3. Cập nhật trạng thái đơn hàng sang PROCESSING và thanh toán sang PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        paymentStatus: "PAID",
      },
    });

    // Gửi email thông báo cập nhật thanh toán và duyệt đơn hàng (non-blocking)
    try {
      const user = await prisma.user.findUnique({
        where: { id: updatedOrder.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `[SportStore] Xác nhận thanh toán & Duyệt đơn hàng #${updatedOrder.id.slice(-8).toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Thanh toán thành công & Đơn hàng đã được duyệt</h2>
              <p>Xin chào <strong>${updatedOrder.fullName || user.name || 'Khách hàng'}</strong>,</p>
              <p>Chúng tôi xác nhận đã nhận được khoản thanh toán trực tuyến cho đơn hàng <strong>#${updatedOrder.id.toUpperCase()}</strong> của bạn.</p>
              <p>Trạng thái đơn hàng hiện tại là: <span style="color: #22c55e; font-weight: bold;">Đang xử lý (Đã thanh toán)</span>. Chúng tôi đang đóng gói sản phẩm và sẽ nhanh chóng bàn giao cho đơn vị vận chuyển.</p>
              <p>Thông tin giao hàng:</p>
              <ul>
                <li><strong>Người nhận:</strong> ${updatedOrder.fullName}</li>
                <li><strong>Số điện thoại:</strong> ${updatedOrder.phone}</li>
                <li><strong>Địa chỉ nhận hàng:</strong> ${updatedOrder.address}</li>
                <li><strong>Tổng thanh toán:</strong> ${updatedOrder.totalAmount.toLocaleString('vi-VN')}đ</li>
              </ul>
              <p>Cảm ơn bạn đã tin tưởng mua sắm tại SportStore!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
            </div>
          `
        }).catch(err => console.error("Lỗi gửi email xác nhận thanh toán webhook:", err));
      }
    } catch (e) {
      console.error("Lỗi gửi email xác nhận thanh toán webhook:", e);
    }

    console.log(`✅ [Webhook Payment] Xác nhận thanh toán thành công cho đơn hàng: #${orderId.slice(-8).toUpperCase()} - Số tiền: ${amount || order.totalAmount}₫`);

    return NextResponse.json({
      success: true,
      message: "Cập nhật thanh toán và duyệt đơn hàng thành công qua Webhook",
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus,
      },
    });
  } catch (error: any) {
    console.error("❌ Lỗi xử lý Webhook thanh toán:", error);
    return NextResponse.json(
      { error: error.message || "Lỗi xử lý Webhook thanh toán" },
      { status: 500 }
    );
  }
}
