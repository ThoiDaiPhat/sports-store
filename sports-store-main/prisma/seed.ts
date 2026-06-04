import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu với ảnh Unsplash chuyên nghiệp...");

  // ==========================================
  // 1. Tạo tài khoản Admin
  // ==========================================
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sportstore.com" },
    update: {},
    create: {
      email: "admin@sportstore.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log("✅ Tạo admin:", admin.email);

  // Tạo tài khoản User mẫu
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@sportstore.com" },
    update: {},
    create: {
      email: "user@sportstore.com",
      password: userPassword,
      name: "Nguyễn Văn A",
      role: "USER",
      phone: "0901234567",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    },
  });
  console.log("✅ Tạo user:", user.email);

  // ==========================================
  // 2. Tạo danh mục (Categories) với ảnh Unsplash
  // ==========================================
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "giay-chay-bo" },
      update: {
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop",
      },
      create: {
        name: "Giày chạy bộ",
        slug: "giay-chay-bo",
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "giay-bong-da" },
      update: {
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop",
      },
      create: {
        name: "Giày bóng đá",
        slug: "giay-bong-da",
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "ao-the-thao" },
      update: {
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop",
      },
      create: {
        name: "Áo thể thao",
        slug: "ao-the-thao",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "phu-kien" },
      update: {
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
      },
      create: {
        name: "Phụ kiện",
        slug: "phu-kien",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { slug: "quan-the-thao" },
      update: {
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop",
      },
      create: {
        name: "Quần thể thao",
        slug: "quan-the-thao",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop",
      },
    }),
  ]);
  console.log("✅ Tạo/Cập nhật", categories.length, "danh mục");

  // ==========================================
  // 3. Tạo sản phẩm mẫu (Products)
  // ==========================================
  const products = [
    {
      name: "Air Max Pro Runner",
      slug: "air-max-pro-runner",
      description:
        "Giày chạy bộ cao cấp với công nghệ đệm Air Max, mang lại cảm giác êm ái và nhẹ nhàng cho từng bước chạy. Thiết kế thoáng khí với lớp lưới Flyknit giúp chân luôn khô thoáng.",
      price: 2890000,
      originalPrice: 3490000,
      stock: 50,
      sizes: JSON.stringify(["38", "39", "40", "41", "42", "43", "44"]),
      colors: JSON.stringify(["Đen", "Trắng", "Đỏ"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      name: "Ultra Boost Speed",
      slug: "ultra-boost-speed",
      description:
        "Giày chạy bộ Ultra Boost với đế Boost hoàn toàn mới, tối ưu khả năng hoàn trả năng lượng. Phần upper Primeknit ôm chân hoàn hảo, phù hợp cho cả chạy bộ và tập gym.",
      price: 3290000,
      originalPrice: 3990000,
      stock: 35,
      sizes: JSON.stringify(["39", "40", "41", "42", "43"]),
      colors: JSON.stringify(["Đen", "Xám", "Xanh Navy"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      name: "Phantom Elite FG",
      slug: "phantom-elite-fg",
      description:
        "Giày bóng đá Phantom Elite với bề mặt Flytouch cho cảm giác kiểm soát bóng tuyệt vời. Đế FG với đinh chống trơn trượt, lý tưởng cho sân cỏ tự nhiên.",
      price: 4590000,
      originalPrice: 5290000,
      stock: 20,
      sizes: JSON.stringify(["39", "40", "41", "42", "43", "44"]),
      colors: JSON.stringify(["Đen/Vàng", "Trắng/Đỏ"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[1].id,
    },
    {
      name: "Mercurial Superfly IX",
      slug: "mercurial-superfly-ix",
      description:
        "Giày bóng đá Mercurial Superfly thế hệ mới nhất với cổ cao Dynamic Fit. Bề mặt NikeSkin giúp kiểm soát bóng ở tốc độ cao. Đế Aerotrak nhẹ và linh hoạt.",
      price: 5190000,
      originalPrice: null,
      stock: 15,
      sizes: JSON.stringify(["40", "41", "42", "43"]),
      colors: JSON.stringify(["Cam/Đen", "Xanh Lá/Đen"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[1].id,
    },
    {
      name: "Áo Jersey Pro Dry-Fit",
      slug: "ao-jersey-pro-dry-fit",
      description:
        "Áo thể thao Dry-Fit với công nghệ thấm hút mồ hôi tiên tiến, giữ cơ thể luôn khô ráo trong suốt buổi tập. Chất liệu co giãn 4 chiều cho sự thoải mái tối đa.",
      price: 790000,
      originalPrice: 990000,
      stock: 100,
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify(["Đen", "Trắng", "Đỏ", "Xanh"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop",
      ]),
      isFeatured: false,
      categoryId: categories[2].id,
    },
    {
      name: "Áo Tank Top Training",
      slug: "ao-tank-top-training",
      description:
        "Áo tank top tập gym với thiết kế rộng rãi, thoáng mát. Chất liệu mesh ở lưng giúp thoát nhiệt hiệu quả. Phù hợp cho các bài tập cardio và weight training.",
      price: 490000,
      originalPrice: 650000,
      stock: 80,
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify(["Đen", "Trắng", "Xám"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop",
      ]),
      isFeatured: false,
      categoryId: categories[2].id,
    },
    {
      name: "Balo Thể Thao Pro Max",
      slug: "balo-the-thao-pro-max",
      description:
        "Balo thể thao đa năng với nhiều ngăn chứa tiện lợi. Ngăn riêng cho laptop 15 inch, ngăn đựng giày riêng biệt, và ngăn đựng bình nước bên hông. Chất liệu chống nước.",
      price: 1290000,
      originalPrice: 1590000,
      stock: 40,
      sizes: JSON.stringify(["One Size"]),
      colors: JSON.stringify(["Đen", "Xám"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[3].id,
    },
    {
      name: "Bóng Rổ Elite Tournament",
      slug: "bong-ro-elite-tournament",
      description:
        "Bóng rổ size 7 chuẩn thi đấu với chất liệu da PU cao cấp, bám tay tốt. Thiết kế kênh sâu giúp kiểm soát bóng ổn định. Đạt tiêu chuẩn FIBA.",
      price: 890000,
      originalPrice: null,
      stock: 30,
      sizes: JSON.stringify(["Size 7"]),
      colors: JSON.stringify(["Cam/Đen"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop"]),
      isFeatured: false,
      categoryId: categories[3].id,
    },
    {
      name: "Quần Short Training Flex",
      slug: "quan-short-training-flex",
      description:
        "Quần short tập luyện với chất liệu Flex co giãn tối đa. Cạp chun êm ái, túi zip an toàn cho điện thoại và chìa khóa. Thiết kế ngắn gọn, năng động.",
      price: 590000,
      originalPrice: 750000,
      stock: 70,
      sizes: JSON.stringify(["S", "M", "L", "XL", "XXL"]),
      colors: JSON.stringify(["Đen", "Xám Đậm", "Xanh Navy"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop",
      ]),
      isFeatured: false,
      categoryId: categories[4].id,
    },
    {
      name: "Quần Jogger Pro Slim",
      slug: "quan-jogger-pro-slim",
      description:
        "Quần jogger dáng slim fit với chất liệu Tech Fleece giữ ấm nhưng vẫn nhẹ. Bo chân thời trang, túi zip hai bên. Phù hợp cho cả tập luyện và đi chơi.",
      price: 990000,
      originalPrice: 1290000,
      stock: 45,
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify(["Đen", "Xám"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[4].id,
    },
    {
      name: "Găng Tay Tập Gym Pro",
      slug: "gang-tay-tap-gym-pro",
      description:
        "Găng tay tập gym với lớp đệm gel bảo vệ lòng bàn tay. Chất liệu da tổng hợp bền bỉ, thoáng khí. Quai dán Velcro chắc chắn, dễ tháo lắp.",
      price: 350000,
      originalPrice: 450000,
      stock: 60,
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify(["Đen", "Đen/Đỏ"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop"]),
      isFeatured: false,
      categoryId: categories[3].id,
    },
    {
      name: "Giày Training X9000",
      slug: "giay-training-x9000",
      description:
        "Giày tập gym đa năng X9000 với đế phẳng ổn định cho bài tập nặng. Lưới thoáng khí Adaptive Mesh, đệm CloudFoam êm ái. Phù hợp cho squat, deadlift và cardio.",
      price: 2190000,
      originalPrice: 2690000,
      stock: 25,
      sizes: JSON.stringify(["39", "40", "41", "42", "43", "44"]),
      colors: JSON.stringify(["Đen/Trắng", "Xám/Xanh"]),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop",
      ]),
      isFeatured: true,
      categoryId: categories[0].id,
    },
  ];

  // 1. Delete all variants first to start clean
  await prisma.productVariant.deleteMany({});

  for (const product of products) {
    const dbProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        images: product.images,
      },
      create: product,
    });

    // Generate variants for this product
    const sizes = typeof product.sizes === "string" ? JSON.parse(product.sizes) : product.sizes;
    const colors = typeof product.colors === "string" ? JSON.parse(product.colors) : product.colors;

    if (Array.isArray(sizes) && Array.isArray(colors)) {
      for (const size of sizes) {
        for (const color of colors) {
          const sku = `${product.slug}-${size}-${color}`.toLowerCase().replace(/\s+/g, "-");
          await prisma.productVariant.create({
            data: {
              productId: dbProduct.id,
              size,
              color,
              sku,
              stock: Math.floor(Math.random() * 20) + 10, // 10 to 29 in stock
            },
          });
        }
      }
    }
  }
  console.log("✅ Cập nhật", products.length, "sản phẩm mẫu và các biến thể");

  // ==========================================
  // 4. Tạo mã giảm giá mẫu (Coupons) với các ràng buộc mới
  // ==========================================
  const coupons = [
    {
      code: "SALEOFF10",
      discountPercent: 10,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm
      isActive: true,
      minOrderAmount: 200000, // Đơn tối thiểu 200k
      maxDiscountAmount: 100000, // Giảm tối đa 100k
      usageLimit: 100,
    },
    {
      code: "FREESHIP",
      discountPercent: 15,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      minOrderAmount: 500000, // Đơn tối thiểu 500k
      maxDiscountAmount: 50000, // Giảm tối đa 50k
      usageLimit: 200,
    },
    {
      code: "WELCOME5",
      discountPercent: 5,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      usageLimit: 1000,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        discountPercent: coupon.discountPercent,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        usageLimit: coupon.usageLimit,
      },
      create: coupon,
    });
  }
  console.log("✅ Tạo/Cập nhật", coupons.length, "mã giảm giá mẫu");

  // ==========================================
  // 5. Tạo một số đơn hàng mẫu (Orders) trong 7 ngày gần nhất để vẽ biểu đồ doanh thu thực tế
  // ==========================================
  console.log("🌱 Đang tạo một số đơn hàng mẫu trong 7 ngày gần nhất để hiển thị biểu đồ sinh động...");
  
  // Xóa các đơn hàng cũ để seed đồng bộ
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  const dbProducts = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });
  const dbUser = await prisma.user.findFirst({ where: { email: "user@sportstore.com" } });

  if (dbUser && dbProducts.length > 0) {
    const statuses: ("PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED")[] = [
      "DELIVERED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "PENDING",
      "DELIVERED",
    ];

    const customerNames = [
      "Nguyễn Văn A",
      "Trần Thị B",
      "Lê Văn C",
      "Phạm Minh D",
      "Hoàng Thị E",
      "Ngô Tiến F",
    ];

    // Tạo đơn hàng cho mỗi ngày trong 7 ngày qua
    for (let i = 6; i >= 0; i--) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - i);
      // Đặt giờ ngẫu nhiên
      orderDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

      // Mỗi ngày có 1 hoặc 2 đơn hàng, trừ ngày hôm nay (0) có 2 đơn
      const numOrders = i === 0 ? 2 : (Math.random() > 0.3 ? 1 : 2);

      for (let j = 0; j < numOrders; j++) {
        const numItems = Math.floor(Math.random() * 2) + 1;
        const selectedProducts: typeof dbProducts = [];
        const shuff = [...dbProducts].sort(() => 0.5 - Math.random());
        for (let k = 0; k < numItems; k++) {
          selectedProducts.push(shuff[k]);
        }

        let totalAmount = 0;
        const orderItemsData = [];

        for (const p of selectedProducts) {
          const qty = Math.floor(Math.random() * 2) + 1;
          const variant = p.variants[Math.floor(Math.random() * p.variants.length)];
          
          if (!variant) continue;

          totalAmount += p.price * qty;

          orderItemsData.push({
            productId: p.id,
            variantId: variant.id,
            quantity: qty,
            price: p.price,
            size: variant.size,
            color: variant.color,
          });
        }

        if (orderItemsData.length === 0) continue;

        const discountAmount = Math.round(totalAmount * 0.05);
        const finalAmount = totalAmount - discountAmount;

        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];

        await prisma.order.create({
          data: {
            userId: dbUser.id,
            status: orderStatus,
            totalAmount: finalAmount,
            fullName: customerName,
            phone: "09" + Math.floor(10000000 + Math.random() * 90000000),
            address: "Số " + Math.floor(Math.random() * 150 + 1) + " Đường Lê Lợi, TP. Hồ Chí Minh",
            createdAt: orderDate,
            updatedAt: orderDate,
            couponCode: "WELCOME5",
            discountAmount,
            paymentMethod: Math.random() > 0.5 ? "ONLINE" : "COD",
            paymentStatus: orderStatus === "DELIVERED" ? "PAID" : (Math.random() > 0.5 ? "PAID" : "UNPAID"),
            items: {
              create: orderItemsData,
            },
          },
        });
      }
    }
    console.log("✅ Seed thành công các đơn hàng thực tế trong 7 ngày qua.");
  }

  console.log("\n🎉 Seed dữ liệu hoàn tất!");
  console.log("📧 Admin: admin@sportstore.com / admin123");
  console.log("📧 User: user@sportstore.com / user123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Lỗi seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
