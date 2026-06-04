import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// GET: Lấy danh sách đơn hàng (Admin lấy hết, User thường chỉ lấy đơn của họ)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const userRole = (session.user as any)?.role;
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Tài khoản không hợp lệ" },
        { status: 401 }
      );
    }

    const where: any = {};

    // Nếu không phải ADMIN, chỉ lấy đơn hàng của chính mình
    if (userRole !== "ADMIN") {
      where.userId = userId;
    }

    // Lọc theo trạng thái
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
            variant: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Parse product images
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          images: typeof item.product.images === "string" ? JSON.parse(item.product.images) : item.product.images,
        },
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách đơn hàng" },
      { status: 500 }
    );
  }
}

// POST: Tạo đơn hàng mới (Dành cho Checkout)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập trước khi thanh toán" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      address,
      note,
      items,
      totalAmount,
      couponCode,
      discountAmount,
      paymentMethod,
    } = body;

    if (!fullName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Thiếu thông tin đặt hàng bắt buộc" },
        { status: 400 }
      );
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin người dùng" },
        { status: 401 }
      );
    }

    // Sử dụng transaction để tạo order và giảm stock của sản phẩm
    // ✅ BẢO MẬT: Giá sản phẩm được lấy trực tiếp từ database, KHÔNG tin tưởng giá client gửi lên
    const newOrder = await prisma.$transaction(async (tx) => {
      let serverCalculatedTotal = 0;

      // 1. Kiểm tra tồn kho & tính tổng tiền từ database trước (theo biến thể)
      const validatedItems = [];
      for (const item of items) {
        const { productId, quantity, size, color } = item;

        // Tìm variant cụ thể từ DB
        const variant = await tx.productVariant.findFirst({
          where: {
            productId,
            size,
            color,
          },
          include: {
            product: true,
          },
        });

        if (!variant) {
          throw new Error(`Biến thể size: ${size}, màu: ${color} không tồn tại cho sản phẩm này`);
        }

        if (variant.stock < quantity) {
          throw new Error(`Sản phẩm "${variant.product.name}" (Size: ${size}, Màu: ${color}) không đủ số lượng trong kho (Chỉ còn ${variant.stock})`);
        }

        // ✅ Lấy giá thực từ database, không dùng giá client gửi lên
        serverCalculatedTotal += variant.product.price * quantity;
        validatedItems.push({
          productId,
          variantId: variant.id,
          quantity,
          price: variant.product.price, // Giá từ DB
          size,
          color,
          productName: variant.product.name,
        });
      }

      // 2. Tính discount phía server nếu có mã giảm giá
      let serverDiscountAmount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode },
        });
        
        if (coupon && coupon.isActive && new Date(coupon.expiryDate) > new Date()) {
          // A. Kiểm tra minOrderAmount
          if (serverCalculatedTotal >= coupon.minOrderAmount) {
            // B. Kiểm tra usageLimit
            const usageCount = await tx.order.count({
              where: { couponCode: coupon.code },
            });

            if (usageCount < coupon.usageLimit) {
              // C. Tính discountAmount
              let disc = (serverCalculatedTotal * coupon.discountPercent) / 100;
              if (coupon.maxDiscountAmount !== null && disc > coupon.maxDiscountAmount) {
                disc = coupon.maxDiscountAmount;
              }
              serverDiscountAmount = Math.round(disc);
            }
          }
        }
      }

      const serverFinalTotal = serverCalculatedTotal - serverDiscountAmount;

      // 3. Tạo đơn hàng chính với giá đã validate từ server
      const order = await tx.order.create({
        data: {
          userId,
          fullName,
          phone,
          address,
          note: note || "",
          totalAmount: serverFinalTotal,
          couponCode: couponCode || null,
          discountAmount: serverDiscountAmount,
          paymentMethod: paymentMethod || "COD",
          paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "UNPAID",
        },
      });

      // 4. Tạo OrderItem và giảm stock
      for (const item of validatedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          },
        });

        // Giảm stock của variant cụ thể
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Giảm stock tổng của Product
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    // 5. Gửi email xác nhận đơn hàng (non-blocking)
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      const emailTo = user?.email || session.user?.email;

      if (emailTo) {
        sendEmail({
          to: emailTo,
          subject: `[SportStore] Xác nhận đơn hàng #${newOrder.id.slice(-8).toUpperCase()}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
              <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Cảm ơn bạn đã mua hàng tại SportStore!</h2>
              <p>Xin chào <strong>${fullName}</strong>,</p>
              <p>Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành chuẩn bị đóng gói.</p>
              <p><strong>Mã đơn hàng:</strong> #${newOrder.id.toUpperCase()}</p>
              <p><strong>Phương thức thanh toán:</strong> ${paymentMethod === "ONLINE" ? "Chuyển khoản Online" : "COD (Thanh toán khi nhận hàng)"}</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Sản phẩm</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Số lượng</th>
                    <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd;">${item.name || 'Sản phẩm'} (Size: ${item.size}, Màu: ${item.color})</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <p style="text-align: right; font-size: 16px;"><strong>Tổng thanh toán: ${newOrder.totalAmount.toLocaleString('vi-VN')}đ</strong></p>
              <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được chuyển đi.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">SportStore — Hệ thống phân phối đồ thể thao cao cấp</p>
            </div>
          `
        }).catch(err => console.error("Lỗi gửi email xác nhận đơn hàng:", err));
      }
    } catch (e) {
      console.error("Lỗi lấy thông tin email người dùng:", e);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("❌ Lỗi tạo đơn hàng:", error);
    return NextResponse.json(
      { error: error.message || "Không thể tạo đơn hàng" },
      { status: 500 }
    );
  }
}
