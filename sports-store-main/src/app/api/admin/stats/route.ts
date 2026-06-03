import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check auth & role
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    // 1. Tính tổng doanh thu từ các đơn hàng ĐÃ GIAO (DELIVERED) hoặc ĐANG XỬ LÝ/ĐANG GIAO
    // Ở đây ta cộng tất cả các đơn hàng không bị HỦY (CANCELLED)
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // 2. Đếm tổng số đơn hàng
    const totalOrders = await prisma.order.count();

    // 3. Đếm tổng số sản phẩm
    const totalProducts = await prisma.product.count();

    // 4. Đếm tổng số khách hàng (Role USER)
    const totalCustomers = await prisma.user.count({
      where: {
        role: "USER",
      },
    });

    // 4.5. Lấy doanh thu thực tế của 7 ngày gần nhất để vẽ biểu đồ
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        status: {
          not: "CANCELLED",
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    // Gom nhóm doanh thu theo từng ngày
    const daysMap = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dailyStats: Record<string, number> = {};

    // Khởi tạo 7 ngày gần nhất với giá trị 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysMap[d.getDay()];
      dailyStats[dayName] = 0;
    }

    // Cộng dồn doanh thu
    weeklyOrders.forEach((order) => {
      const dayName = daysMap[new Date(order.createdAt).getDay()];
      if (dailyStats[dayName] !== undefined) {
        dailyStats[dayName] += order.totalAmount;
      }
    });

    // Chuyển thành mảng biểu đồ
    const weeklyRevenue = Object.keys(dailyStats).map((day) => ({
      label: day,
      value: dailyStats[day],
    }));

    // 5. Lấy 5 đơn hàng gần nhất
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      weeklyRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error("❌ Lỗi lấy thống kê Admin:", error);
    return NextResponse.json(
      { error: "Không thể tải số liệu thống kê" },
      { status: 500 }
    );
  }
}
