import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    // 1. Tìm đơn hàng cần hủy
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    // 2. Kiểm tra bảo mật
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Bạn không có quyền hủy đơn hàng này" },
        { status: 403 }
      );
    }

    // 3. Kiểm tra trạng thái đơn hàng (chỉ cho phép hủy khi đang PENDING)
    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Đơn hàng chỉ có thể hủy khi ở trạng thái Chờ xử lý" },
        { status: 400 }
      );
    }

    // 4. Hủy đơn hàng và hoàn trả lại số lượng tồn kho trong Transaction
    const cancelledOrder = await prisma.$transaction(async (tx) => {
      // A. Cập nhật trạng thái đơn hàng sang CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
        },
      });

      // B. Hoàn lại tồn kho cho từng biến thể sản phẩm
      for (const item of order.items) {
        // Cộng lại kho của variant cụ thể
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        // Cộng lại kho tổng của Product
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    });

    // 5. Gửi email thông báo hủy đơn hàng (non-blocking)
    try {
      const user = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        sendEmail({
          to: user.email,
          subject: `[SportStore] Đơn hàng #${order.id.slice(-8).toUpperCase()} đã được hủy thành công`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Đơn hàng đã được hủy thành công</h2>
              <p>Xin chào <strong>${order.fullName || user.name || 'Khách hàng'}</strong>,</p>
              <p>Chúng tôi xác nhận đơn hàng <strong>#${order.id.toUpperCase()}</strong> của bạn đã được hủy thành công trên hệ thống.</p>
              <p>Hệ thống đã tự động hoàn trả lại số lượng tồn kho cho các sản phẩm trong đơn hàng.</p>
              <p>Nếu bạn có bất kỳ thắc mắc nào hoặc muốn đặt lại đơn hàng mới, xin vui lòng truy cập website của chúng tôi.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
            </div>
          `
        }).catch(err => console.error("Lỗi gửi email hủy đơn hàng:", err));
      }
    } catch (e) {
      console.error("Lỗi gửi email hủy đơn hàng:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      order: cancelledOrder,
    });
  } catch (error: any) {
    console.error("❌ Lỗi hủy đơn hàng:", error);
    return NextResponse.json(
      { error: error.message || "Không thể hủy đơn hàng" },
      { status: 500 }
    );
  }
}
