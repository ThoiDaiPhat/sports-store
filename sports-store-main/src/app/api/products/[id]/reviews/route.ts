import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Lấy danh sách reviews của sản phẩm
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("❌ Lỗi lấy đánh giá sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách đánh giá" },
      { status: 500 }
    );
  }
}

// POST: Gửi đánh giá mới (Cần đăng nhập)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để viết đánh giá" },
        { status: 401 }
      );
    }

    const { id: productId } = await params;
    const userId = (session.user as any).id;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5 || !comment?.trim()) {
      return NextResponse.json(
        { error: "Thông tin đánh giá không hợp lệ" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("❌ Lỗi gửi đánh giá sản phẩm:", error);
    return NextResponse.json(
      { error: "Không thể gửi đánh giá" },
      { status: 500 }
    );
  }
}
