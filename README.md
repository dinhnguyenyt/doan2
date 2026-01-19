# Hướng Dẫn Cài Đặt và Chạy Dự Án ALIBARBIE

## 📋 Mục Lục
1. [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
2. [Cài Đặt Dependencies](#cài-đặt-dependencies)
3. [Cấu Hình Database](#cấu-hình-database)
4. [Cấu Hình Biến Môi Trường](#cấu-hình-biến-môi-trường)
5. [Chạy Dự Án](#chạy-dự-án)
6. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết:
- **Node.js** (phiên bản 14.x trở lên) - [Download tại đây](https://nodejs.org/)
- **MongoDB** (phiên bản 4.x trở lên) - [Download tại đây](https://www.mongodb.com/try/download/community)
- **npm** hoặc **yarn** (đi kèm với Node.js)
- **Git** (tùy chọn) - [Download tại đây](https://git-scm.com/)

### Kiểm Tra Cài Đặt:
```bash
node --version    # Kiểm tra phiên bản Node.js
npm --version     # Kiểm tra phiên bản npm
mongod --version  # Kiểm tra phiên bản MongoDB
```

---

## 📦 Cài Đặt Dependencies

### Bước 1: Clone hoặc Download Project
```bash
# Nếu sử dụng Git
git clone <repository-url>
cd Alibarbie-web/Alibarbie-web

# Hoặc giải nén file ZIP và di chuyển vào thư mục project
```

### Bước 2: Cài Đặt Dependencies cho Server
```bash
# Di chuyển vào thư mục server
cd server

# Cài đặt các package cần thiết
npm install

# Hoặc sử dụng yarn
yarn install
```

### Bước 3: Cài Đặt Dependencies cho Client
```bash
# Quay về thư mục gốc và di chuyển vào thư mục client
cd ../client

# Cài đặt các package cần thiết
npm install

# Hoặc sử dụng yarn
yarn install
```

---

## 🗄️ Cấu Hình Database

### Bước 1: Khởi Động MongoDB
```bash
# Windows
mongod

# Mac/Linux
sudo mongod

# Hoặc nếu MongoDB đã được cài đặt như một service
# Nó sẽ tự động chạy khi khởi động máy
```

### Bước 2: Tạo Database
MongoDB sẽ tự động tạo database khi ứng dụng kết nối lần đầu. Bạn chỉ cần đảm bảo MongoDB đang chạy.

**Lưu ý:** Nếu MongoDB chạy trên cổng mặc định (27017), bạn không cần cấu hình thêm.

---

## ⚙️ Cấu Hình Biến Môi Trường

### Bước 1: Tạo File .env trong Thư Mục Server

Tạo file `.env` trong thư mục `server/` với nội dung sau:

```env
# Database Configuration
CONNECT_DB=mongodb://localhost:27017/alibarbie

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
EXPIRES_IN=3600

# CORS Configuration
CORS_CLIENT=http://localhost:3000

# Gmail OAuth2 Configuration (Cho chức năng gửi email)
CLIENT_ID=your_gmail_client_id
CLIENT_SECRET=your_gmail_client_secret
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=your_gmail_refresh_token
```

### Bước 2: Giải Thích Các Biến Môi Trường

#### Database (CONNECT_DB)
- **Format:** `mongodb://localhost:27017/database_name`
- **Ví dụ:** `mongodb://localhost:27017/alibarbie`
- Nếu MongoDB có username/password: `mongodb://username:password@localhost:27017/alibarbie`
- Nếu MongoDB chạy trên cloud (MongoDB Atlas): `mongodb+srv://username:password@cluster.mongodb.net/alibarbie`

#### JWT (JWT_SECRET, EXPIRES_IN)
- **JWT_SECRET:** Chuỗi bí mật để mã hóa JWT token (nên dùng chuỗi ngẫu nhiên dài và phức tạp)
- **EXPIRES_IN:** Thời gian hết hạn của token (tính bằng giây), ví dụ: `3600` = 1 giờ

#### CORS (CORS_CLIENT)
- URL của client React, mặc định: `http://localhost:3000`
- Nếu deploy, thay đổi thành URL production

#### Gmail OAuth2 (Cho Email)
Để cấu hình Gmail OAuth2, bạn cần:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Bật Gmail API
4. Tạo OAuth 2.0 credentials
5. Sử dụng [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) để lấy refresh token

**Lưu ý:** Nếu không cần chức năng gửi email, bạn có thể bỏ qua các biến này (nhưng code có thể báo lỗi khi gọi API email).

---

## 🚀 Chạy Dự Án

### Cách 1: Chạy Server và Client Riêng Biệt (Khuyến Nghị)

#### Terminal 1 - Chạy Server:
```bash
# Di chuyển vào thư mục server
cd server

# Chạy server (sử dụng nodemon để auto-reload)
npm start

# Server sẽ chạy trên http://localhost:5000
# Bạn sẽ thấy thông báo: "MongoDB connected" và "Example app listening on port 5000"
```

#### Terminal 2 - Chạy Client:
```bash
# Di chuyển vào thư mục client
cd client

# Chạy client React
npm start

# Client sẽ tự động mở trình duyệt tại http://localhost:3000
# Nếu không tự động mở, truy cập thủ công: http://localhost:3000
```

### Cách 2: Chạy Bằng Script (Nếu có)

Nếu bạn đã tạo script để chạy cả hai cùng lúc, sử dụng:

```bash
# Windows PowerShell
npm run dev

# Hoặc tạo script tùy chỉnh trong package.json
```

---

## 📁 Cấu Trúc Dự Án

```
Alibarbie-web/
├── client/                 # Frontend React Application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── config/        # Cấu hình API
│   │   ├── Layouts/        # Các layout component
│   │   ├── Pages/         # Các trang chính
│   │   ├── redux/         # Redux store và actions
│   │   ├── Route/         # React Router configuration
│   │   └── ...
│   └── package.json
│
└── server/                 # Backend Node.js/Express Application
    ├── src/
    │   ├── config/        # Cấu hình database
    │   ├── controller/    # Business logic
    │   ├── model/         # MongoDB models
    │   ├── route/         # API routes
    │   ├── utils/         # Utilities (ChatBot)
    │   └── server.js      # Entry point
    ├── uploads/            # Thư mục lưu file upload
    └── package.json
```

---

## 🔍 Kiểm Tra Dự Án Đã Chạy Thành Công

### Server (Backend):
- ✅ Console hiển thị: `MongoDB connected`
- ✅ Console hiển thị: `Example app listening on port 5000`
- ✅ Truy cập: `http://localhost:5000` (có thể không có giao diện, chỉ API)

### Client (Frontend):
- ✅ Trình duyệt tự động mở tại `http://localhost:3000`
- ✅ Trang chủ hiển thị bình thường
- ✅ Không có lỗi trong Console của trình duyệt (F12)

### Kiểm Tra API:
Mở trình duyệt hoặc Postman và truy cập:
- `http://localhost:5000/api/products` - Lấy danh sách sản phẩm

---

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```bash
# Giải pháp: Xóa node_modules và cài đặt lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "MongoDB connection failed"
- ✅ Kiểm tra MongoDB đã được khởi động chưa
- ✅ Kiểm tra chuỗi kết nối trong file `.env`
- ✅ Kiểm tra MongoDB có chạy trên cổng 27017 không

### Lỗi: "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Lỗi: "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Lỗi CORS
- ✅ Kiểm tra biến `CORS_CLIENT` trong file `.env` của server
- ✅ Đảm bảo URL khớp với URL client đang chạy

### Lỗi: "JWT_SECRET is not defined"
- ✅ Kiểm tra file `.env` đã được tạo trong thư mục `server/`
- ✅ Kiểm tra tên biến trong `.env` khớp với code

### Client không kết nối được với Server
- ✅ Kiểm tra server đã chạy chưa
- ✅ Kiểm tra URL trong `client/src/config/Connect.js` là `http://localhost:5000`
- ✅ Kiểm tra CORS configuration

---

## 📝 Các Tính Năng Chính

### Frontend (Client):
- ✅ Trang chủ với slider và sản phẩm nổi bật
- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Xem danh sách sản phẩm và chi tiết sản phẩm
- ✅ Giỏ hàng (quản lý bằng Redux + localStorage)
- ✅ Thanh toán (VNPay và COD)
- ✅ Quản lý thông tin người dùng
- ✅ Chatbot real-time
- ✅ Blog
- ✅ Admin Dashboard (chỉ admin)

### Backend (Server):
- ✅ RESTful API
- ✅ Xác thực JWT
- ✅ Quản lý người dùng (CRUD)
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý giỏ hàng
- ✅ Quản lý đơn hàng
- ✅ Tích hợp VNPay
- ✅ Gửi email (Gmail OAuth2)
- ✅ Socket.IO cho chat real-time
- ✅ Upload file (avatar)

---

## 🔐 Tài Khoản Mặc Định

Sau khi chạy project, bạn cần đăng ký tài khoản mới thông qua form đăng ký.

**Lưu ý:** Để tạo tài khoản admin, bạn cần:
1. Đăng ký tài khoản thông thường
2. Vào MongoDB và set `isAdmin: true` cho user đó
3. Hoặc thêm logic trong code để tự động tạo admin đầu tiên

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng kiểm tra:
1. ✅ Tất cả dependencies đã được cài đặt
2. ✅ MongoDB đang chạy
3. ✅ File `.env` đã được cấu hình đúng
4. ✅ Cổng 3000 và 5000 không bị chiếm dụng
5. ✅ Console không có lỗi

---

## 📄 License

ISC

---

**Chúc bạn code vui vẻ! 🎉**
