import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("❌ Lỗi lấy danh mục:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách danh mục" },
      { status: 500 }
    );
  }
}
