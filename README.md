Hệ thống Quản lý Nhà thuốc

Hệ thống quản lý nhà thuốc full-stack sử dụng Next.js, Neon PostgreSQL và Drizzle ORM.

Tính năng

- Quản lý thuốc: thêm, sửa, xóa, tìm kiếm thuốc
- Quản lý nhà cung cấp: thêm, sửa, xóa, tìm kiếm nhà cung cấp
- Quản lý khách hàng: thêm, sửa, xóa, tìm kiếm khách hàng
- Quản lý tương tác thuốc: kiểm tra tương tác giữa các thuốc
- Quản lý phiếu nhập: tạo phiếu nhập, xem chi tiết, xóa phiếu nhập
- Quản lý hóa đơn: tạo hóa đơn, xem chi tiết, xóa hóa đơn
- Quản lý kho: xem tồn kho, điều chỉnh kho, xem nhật ký kho
- Xác thực và phân quyền: đăng nhập, phân quyền theo vai trò

Công nghệ sử dụng

- **Frontend**: Next.js 14, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **State Management**: React Hooks
- **Styling**: Tailwind CSS

Cài đặt

Yêu cầu

- Node.js 18.0.0 trở lên
- npm hoặc yarn
- Tài khoản Neon PostgreSQL
- 
Các bước cài đặt

1. Clone repository:
   \`\`\`bash
   git clone [https://github.com/your-username/pharmacy-management.git](https://github.com/L0G4NLEE/PharmaCare.git)
   cd pharmacy-management
   \`\`\`

2. Cài đặt dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Tạo file .env.local và thêm các biến môi trường:
   \`\`\`
   DATABASE_URL=postgresql://neondb_owner:npg_UPWhYmDql59V@ep-winter-field-a4cmh41x-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   NODE_ENV=development
   \`\`\`

4. Chạy migrations để tạo schema database:
   \`\`\`bash
   npm run db:migrate
   \`\`\`

5. Seed dữ liệu mẫu:
   \`\`\`bash
   npm run db:seed
   \`\`\`

6. Chạy ứng dụng:
   \`\`\`bash
   npm run dev
   \`\`\`

7. Truy cập ứng dụng tại http://localhost:3000

Cấu trúc thư mục

\`\`\`
pharmacy-management/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   └── ...
├── components/           # React components
├── lib/                  # Utility functions, database config
│   ├── db.ts             # Database connection
│   ├── schema.ts         # Database schema
│   ├── auth.ts           # Authentication config
│   └── ...
├── public/               # Static assets
├── drizzle/              # Drizzle migrations
├── .env.local            # Environment variables
└── ...
\`\`\`

## Scripts

- `npm run dev`: Chạy ứng dụng ở chế độ development
- `npm run build`: Build ứng dụng cho production
- `npm start`: Chạy ứng dụng đã build
- `npm run db:migrate`: Chạy migrations
- `npm run db:seed`: Seed dữ liệu mẫu
- `npm run db:studio`: Mở Drizzle Studio để quản lý database
- 
Tài khoản mặc định

- **Username**: admin
- **Password**: admin123
- **Role**: ADMIN


Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng tạo issue hoặc pull request để đóng góp.

8. Cập nhật package.json với scripts mới
#   P h a r m a C a r e 
 #   P h a r m a C a r e 
 
 
