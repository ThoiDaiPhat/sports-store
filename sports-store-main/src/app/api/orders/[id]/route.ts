import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

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

    // Gửi email thông báo cập nhật trạng thái đơn hàng (non-blocking)
    try {
      const user = await prisma.user.findUnique({
        where: { id: updatedOrder.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        let statusText = "";
        let detailsText = "";

        if (status === "PROCESSING") {
          statusText = "Đang xử lý";
          detailsText = "Đơn hàng của bạn đã được xác nhận và đang trong quá trình đóng gói để gửi đi.";
        } else if (status === "SHIPPED") {
          statusText = "Đang giao hàng";
          detailsText = "Đơn hàng của bạn đã được bàn giao cho đơn vị vận chuyển và đang trên đường giao tới bạn.";
        } else if (status === "DELIVERED") {
          statusText = "Đã giao hàng thành công";
          detailsText = "Đơn hàng của bạn đã được giao thành công! Cảm ơn bạn đã tin tưởng và mua sắm tại SportStore.";
        } else if (status === "CANCELLED") {
          statusText = "Đã hủy";
          detailsText = "Đơn hàng của bạn đã bị hủy bỏ trên hệ thống.";
        }

        if (statusText) {
          sendEmail({
            to: user.email,
            subject: `[SportStore] Cập nhật trạng thái đơn hàng #${updatedOrder.id.slice(-8).toUpperCase()} - ${statusText}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Cập nhật trạng thái đơn hàng</h2>
                <p>Xin chào <strong>${updatedOrder.fullName || user.name || 'Khách hàng'}</strong>,</p>
                <p>Chúng tôi xin thông báo đơn hàng <strong>#${updatedOrder.id.toUpperCase()}</strong> của bạn đã chuyển sang trạng thái: <span style="color: #ef4444; font-weight: bold;">${statusText}</span>.</p>
                <p>${detailsText}</p>
                <p>Thông tin giao hàng:</p>
                <ul>
                  <li><strong>Người nhận:</strong> ${updatedOrder.fullName}</li>
                  <li><strong>Số điện thoại:</strong> ${updatedOrder.phone}</li>
                  <li><strong>Địa chỉ nhận hàng:</strong> ${updatedOrder.address}</li>
                  <li><strong>Tổng thanh toán:</strong> ${updatedOrder.totalAmount.toLocaleString('vi-VN')}đ</li>
                </ul>
                <p>Bạn có thể theo dõi hành trình đơn hàng tại trang lịch sử đơn hàng của mình.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
              </div>
            `
          }).catch(err => console.error("Lỗi gửi email cập nhật trạng thái đơn:", err));
        }
      }
    } catch (e) {
      console.error("Lỗi gửi email cập nhật trạng thái đơn:", e);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("❌ Lỗi cập nhật đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể cập nhật đơn hàng" },
      { status: 500 }
    );
  }
}
