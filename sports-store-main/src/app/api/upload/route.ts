import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check auth & role
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Vui lòng chọn một file ảnh" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Định dạng file không hợp lệ. Chỉ chấp nhận JPG, PNG, WEBP, GIF." },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Kích thước file quá lớn. Vui lòng chọn file dưới 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đường dẫn đích: /public/uploads/products/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

    // Tạo thư mục nếu chưa tồn tại
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Thư mục đã tồn tại
    }

    // Đổi tên file để tránh trùng lặp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.name) || ".jpg";
    const filename = `product-${uniqueSuffix}${fileExtension}`;
    const filePath = path.join(uploadDir, filename);

    // Ghi file xuống ổ đĩa
    await writeFile(filePath, buffer);

    // Trả về đường dẫn truy cập static công khai
    const fileUrl = `/uploads/products/${filename}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("❌ Lỗi upload ảnh:", error);
    return NextResponse.json(
      { error: "Không thể upload ảnh" },
      { status: 500 }
    );
  }
}
