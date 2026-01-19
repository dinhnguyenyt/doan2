# 🚀 Hướng Dẫn Nhanh - ALIBARBIE Project

## ⚡ Cài Đặt Nhanh (5 phút)

### Bước 1: Cài Đặt Dependencies
```bash
# Server
cd server
npm install

# Client (mở terminal mới)
cd client
npm install
```

### Bước 2: Tạo File .env cho Server
Tạo file `server/.env` với nội dung:
```env
CONNECT_DB=mongodb://localhost:27017/alibarbie
JWT_SECRET=your_secret_key_123456789
EXPIRES_IN=3600
CORS_CLIENT=http://localhost:3000
```

### Bước 3: Khởi Động MongoDB
```bash
# Windows: Mở Command Prompt và chạy
mongod

# Mac/Linux
sudo mongod
```

### Bước 4: Chạy Dự Án

**Terminal 1 - Server:**
```bash
cd server
npm start
```

**Terminal 2 - Client:**
```bash
cd client
npm start
```

### Bước 5: Truy Cập
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

---

## ✅ Checklist

- [ ] Node.js đã cài đặt (v14+)
- [ ] MongoDB đã cài đặt và đang chạy
- [ ] Dependencies đã được cài đặt (server & client)
- [ ] File `.env` đã được tạo trong thư mục `server/`
- [ ] Server chạy thành công (port 5000)
- [ ] Client chạy thành công (port 3000)

---

## 🐛 Lỗi Thường Gặp

### "Cannot find module"
→ Chạy lại `npm install`

### "MongoDB connection failed"
→ Kiểm tra MongoDB đã khởi động chưa

### "Port already in use"
→ Đóng ứng dụng đang dùng cổng đó hoặc đổi cổng

---

📖 **Xem hướng dẫn chi tiết tại:** [README.md](./README.md)
