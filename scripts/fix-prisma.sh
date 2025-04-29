echo "Bắt đầu khắc phục lỗi Prisma..."

# Xóa thư mục node_modules/.prisma nếu tồn tại
if [ -d "node_modules/.prisma" ]; then
  echo "Đang xóa thư mục node_modules/.prisma..."
  rm -rf node_modules/.prisma
  echo "Đã xóa thư mục node_modules/.prisma"
fi

# Xóa thư mục node_modules/@prisma nếu tồn tại
if [ -d "node_modules/@prisma" ]; then
  echo "Đang xóa thư mục node_modules/@prisma..."
  rm -rf node_modules/@prisma
  echo "Đã xóa thư mục node_modules/@prisma"
fi

# Cài đặt lại prisma và @prisma/client
echo "Đang cài đặt lại prisma và @prisma/client..."
npm uninstall prisma @prisma/client
npm install prisma@5.10.2 --save-dev
npm install @prisma/client@5.10.2

# Chạy prisma generate
echo "Đang chạy prisma generate..."
npx prisma generate

echo "Quá trình khắc phục lỗi Prisma đã hoàn tất"
