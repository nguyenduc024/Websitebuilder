# 🏥 HealthLink – Ứng dụng Desktop Electron

> Ứng dụng quản lý y tế được xây dựng bằng **Electron + React (Vite) + Spring Boot (Java) + SQL Server**.

---

## 📋 Mục lục

- [Tổng quan kiến trúc](#-tổng-quan-kiến-trúc)
- [Yêu cầu phần mềm](#-yêu-cầu-phần-mềm)
- [Cài đặt phần mềm chi tiết](#-cài-đặt-phần-mềm-chi-tiết)
- [VSCode Extensions cần thiết](#-vscode-extensions-cần-thiết)
- [Thiết lập Database](#-thiết-lập-database)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Các lệnh chạy](#-các-lệnh-chạy)
- [Khắc phục lỗi thường gặp](#-khắc-phục-lỗi-thường-gặp)

---

## 🏗 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────┐
│                  Electron Shell                  │
│  ┌───────────────────┐  ┌─────────────────────┐ │
│  │  Frontend (Vite)  │  │  Backend (Spring)    │ │
│  │  React + TS       │──│  Java 21 + Maven     │ │
│  │  localhost:5173    │  │  localhost:8080       │ │
│  └───────────────────┘  └──────────┬──────────┘ │
│                                    │             │
│                          ┌─────────▼──────────┐  │
│                          │   SQL Server 2019+  │  │
│                          │   HEALTHLINK_DB     │  │
│                          └────────────────────┘  │
└─────────────────────────────────────────────────┘
```

| Thành phần | Công nghệ | Port |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui | `5173` |
| Backend | Spring Boot 3.2 + Java 21 + Maven | `8080` |
| Database | Microsoft SQL Server | `1433` |
| Desktop | Electron | – |

---

## 💻 Yêu cầu phần mềm

| Phần mềm | Phiên bản tối thiểu | Bắt buộc |
|---|---|---|
| **Node.js** | `v18.18.0` trở lên (khuyến nghị `v20 LTS`) | ✅ |
| **pnpm** | `v8` trở lên | ✅ |
| **Java JDK** | `21` | ✅ |
| **Apache Maven** | `3.9+` | ✅ |
| **SQL Server** | `2019` trở lên (hoặc SQL Server Express) | ✅ |
| **SQL Server Management Studio (SSMS)** | Bản mới nhất | 🔶 Khuyến nghị |
| **Git** | Bản mới nhất | ✅ |
| **Visual Studio Code** | Bản mới nhất | 🔶 Khuyến nghị |

---

## 🔧 Cài đặt phần mềm chi tiết

### 1. Node.js

Node.js là runtime để chạy frontend (Vite/React) và Electron.

**Windows:**
1. Truy cập [https://nodejs.org](https://nodejs.org)
2. Tải bản **LTS** (khuyến nghị v20)
3. Chạy file `.msi`, nhấn **Next** và giữ mặc định
4. ✅ Đảm bảo tick chọn **"Add to PATH"**
5. Khởi động lại terminal, kiểm tra:
   
   ```bash
   node --version   # v20.x.x
   npm --version    # 10.x.x
   ```

### 2. pnpm (Package Manager)

Dự án sử dụng **pnpm** (xem file `pnpm-workspace.yaml`).

```bash
# Cài đặt pnpm qua npm
npm install -g pnpm

# Kiểm tra
pnpm --version   # 8.x.x hoặc 9.x.x
```

### 3. Java JDK 21

Backend Spring Boot yêu cầu Java 21 (cấu hình trong `pom.xml`).

**Windows:**
1. Truy cập [https://adoptium.net](https://adoptium.net) (Eclipse Temurin) hoặc [Oracle JDK 21](https://www.oracle.com/java/technologies/downloads/#java21)
2. Tải bản **JDK 21** (`.msi` cho Windows)
3. Cài đặt, ✅ tick chọn **"Set JAVA_HOME variable"** và **"Add to PATH"**
4. Kiểm tra:
   ```bash
   java --version    # openjdk 21.x.x hoặc java 21.x.x
   javac --version   # javac 21.x.x
   ```

**Cấu hình biến môi trường thủ công (nếu cần):**
1. Mở **System Properties** → **Environment Variables**
2. Thêm biến **JAVA_HOME**: `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot` (đường dẫn thực tế)
3. Thêm vào **Path**: `%JAVA_HOME%\bin`

### 4. Apache Maven

Maven dùng để build và chạy backend Spring Boot.

**Windows:**
1. Truy cập [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
2. Tải file **Binary zip archive** (`apache-maven-3.9.x-bin.zip`)
3. Giải nén vào `C:\Program Files\Apache\maven` (hoặc nơi bạn muốn)
4. Cấu hình biến môi trường:
   - Thêm biến **MAVEN_HOME**: `C:\Program Files\Apache\maven\apache-maven-3.9.x`
   - Thêm vào **Path**: `%MAVEN_HOME%\bin`
5. Khởi động lại terminal, kiểm tra:
   ```bash
   mvn --version
   # Apache Maven 3.9.x
   # Java version: 21.x.x
   ```

### 5. Microsoft SQL Server

Database chính của ứng dụng.

**Cài đặt SQL Server Express (miễn phí):**
1. Truy cập [https://www.microsoft.com/en-us/sql-server/sql-server-downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Tải bản **Express** (miễn phí)
3. Chạy installer, chọn **Basic Installation**
4. **Quan trọng:** Ghi nhớ thông tin:
   - Server: `localhost` hoặc `localhost\SQLEXPRESS`
   - Port: `1433`

**Bật TCP/IP và Port 1433:**
1. Mở **SQL Server Configuration Manager**
2. Vào **SQL Server Network Configuration** → **Protocols for SQLEXPRESS**
3. Bật **TCP/IP** (Right-click → Enable)
4. Double-click **TCP/IP** → tab **IP Addresses** → cuộn xuống **IPAll**:
   - **TCP Port**: `1433`
   - **TCP Dynamic Ports**: để trống
5. **Restart** SQL Server service

**Cài đặt SQL Server Management Studio (SSMS):**
1. Truy cập [https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms)
2. Tải và cài đặt SSMS

**Cấu hình SQL Authentication:**
1. Mở SSMS, kết nối vào server
2. Right-click server → **Properties** → **Security**
3. Chọn **SQL Server and Windows Authentication mode**
4. Vào **Security** → **Logins** → **sa** → đặt password: `Pasword1234Ki`
5. Ở tab **Status**, chọn **Enabled**
6. Restart SQL Server service

### 6. Git

```bash
# Windows: Tải từ https://git-scm.com/download/win
# Sau khi cài, kiểm tra:
git --version
```

---

## 🧩 VSCode Extensions cần thiết

Mở VSCode, vào tab **Extensions** (`Ctrl+Shift+X`) và cài đặt:

### Bắt buộc (Frontend)
| Extension | ID | Mô tả |
|---|---|---|
| **ESLint** | `dbaeumer.vscode-eslint` | Kiểm tra lỗi JavaScript/TypeScript |
| **Prettier** | `esbenp.prettier-vscode` | Format code tự động |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Gợi ý class TailwindCSS |
| **TypeScript Importer** | `pmneo.tsimporter` | Auto import TypeScript |

### Bắt buộc (Backend Java)
| Extension | ID | Mô tả |
|---|---|---|
| **Extension Pack for Java** | `vscjava.vscode-java-pack` | Bộ extension Java đầy đủ (bao gồm Language Support, Debugger, Maven, Test Runner) |
| **Spring Boot Extension Pack** | `vmware.vscode-boot-dev-pack` | Hỗ trợ Spring Boot (Dashboard, Tools, Initializr) |

### Bắt buộc (Database)
| Extension | ID | Mô tả |
|---|---|---|
| **SQL Server (mssql)** | `ms-mssql.mssql` | Kết nối và truy vấn SQL Server ngay trong VSCode |

### Bắt buộc (Electron/Desktop)
| Extension | ID | Mô tả |
|---|---|---|
| **Debugger for Chrome** | Tích hợp sẵn trong VSCode | Debug Electron renderer process |

### Khuyến nghị thêm
| Extension | ID | Mô tả |
|---|---|---|
| **GitLens** | `eamodio.gitlens` | Xem lịch sử Git nâng cao |
| **Error Lens** | `usernamehw.errorlens` | Hiển thị lỗi inline |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | Tự đổi tên tag HTML/JSX |
| **Material Icon Theme** | `pkief.material-icon-theme` | Icon đẹp cho file explorer |
| **Thunder Client** | `rangav.vscode-thunder-client` | Test API (thay Postman) |

**Cài nhanh qua terminal:**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension vscjava.vscode-java-pack
code --install-extension vmware.vscode-boot-dev-pack
code --install-extension ms-mssql.mssql
code --install-extension eamodio.gitlens
code --install-extension usernamehw.errorlens
```

---

## 🗄 Thiết lập Database

### Bước 1: Tạo Database

Mở SSMS (hoặc extension mssql trong VSCode), kết nối vào SQL Server và chạy file SQL:

```sql
-- Mở file HealthLinkDB/HEALTHLINK_DB.sql và thực thi toàn bộ
-- File này sẽ tạo database HEALTHLINK_DB và các bảng cần thiết
```

Hoặc dùng command line:
```bash
sqlcmd -S localhost -U sa -P Pasword1234Ki -i HealthLinkDB/HEALTHLINK_DB.sql
```

### Bước 2: Kiểm tra kết nối

Thông tin kết nối database (trong `application.properties`):

| Thuộc tính | Giá trị |
|---|---|
| URL | `jdbc:sqlserver://localhost:1433;databaseName=HEALTHLINK_DB` |
| Username | `sa` |
| Password | `Pasword1234Ki` |

> ⚠️ **Lưu ý:** Nếu bạn đặt password khác cho user `sa`, hãy cập nhật file:  
> `HealthLinkJava/src/main/resources/application.properties`

---

## 🚀 Cài đặt và chạy dự án

### Bước 1: Clone repository

```bash
git clone https://github.com/nguyenduc024/Websitebuilder.git
cd Websitebuilder
```

### Bước 2: Cài đặt dependencies (Frontend + Electron)

```bash
npm install
```

> Lệnh này sẽ cài tất cả packages trong `package.json` bao gồm React, Vite, Electron, TailwindCSS, v.v.

### Bước 3: Build backend (lần đầu)

```bash
cd HealthLinkJava
mvn clean install
cd ..
```

### Bước 4: Chạy ứng dụng

Bạn có nhiều cách chạy tùy nhu cầu:

---

## 📝 Các lệnh chạy

### 🖥 Chạy toàn bộ ứng dụng Desktop (Electron + Backend + Frontend)

```bash
npm run dev:desktop
```

> Lệnh này sẽ **tự động**:
> 1. Build lại Electron main process
> 2. Mở Electron ở chế độ development
> 3. Electron tự kiểm tra backend (`8080`) và frontend (`5173`)
> 4. Nếu service nào chưa chạy thì Electron mới tự khởi động service đó
>
> Nếu backend đã chạy sẵn trên port `8080`, lệnh này sẽ **tái sử dụng** backend hiện có thay vì khởi động thêm một tiến trình mới.

### 🌐 Chỉ chạy Frontend (trên trình duyệt)

```bash
npm run dev:frontend
# hoặc
npm run dev
```
Mở trình duyệt: [http://localhost:5173](http://localhost:5173)

### ☕ Chỉ chạy Backend

```bash
npm run dev:backend
# hoặc
cd HealthLinkJava && mvn spring-boot:run
```

### ⚡ Chỉ chạy Electron shell kèm frontend dev server

```bash
npm run dev:electron
```

> Lệnh này sẽ chạy Vite dev server và mở Electron. Backend vẫn được Electron tự kiểm tra, và nếu chưa chạy thì Electron sẽ tự khởi động backend.

### 📦 Build production

```bash
npm run build
```

---

## 🔥 Khắc phục lỗi thường gặp

### ❌ `mvn` không được nhận diện

```
'mvn' is not recognized as an internal or external command
```

**Cách sửa:** Kiểm tra biến môi trường `MAVEN_HOME` và `Path` đã thêm `%MAVEN_HOME%\bin` chưa. Khởi động lại terminal sau khi thêm.

### ❌ `java` không được nhận diện hoặc sai version

```bash
java --version
# Nếu không phải Java 21, kiểm tra JAVA_HOME
echo %JAVA_HOME%
```

### ❌ Không kết nối được SQL Server

1. Kiểm tra SQL Server đã chạy: Mở **Services** (`services.msc`) → tìm **SQL Server** → đảm bảo **Running**
2. Kiểm tra TCP/IP đã bật và port `1433` đã cấu hình
3. Kiểm tra user `sa` đã được bật và password đúng
4. Thử kết nối bằng SSMS trước

### ❌ Electron hiện màn hình "Lỗi khởi động"

- Backend chưa khởi động xong (Spring Boot cần ~30-60 giây lần đầu)
- SQL Server chưa chạy → khởi động SQL Server trước
- Port `8080` hoặc `5173` đã bị chiếm → tắt process đang dùng port đó:
  ```bash
  # Kiểm tra port 8080
  netstat -ano | findstr :8080
  # Kill process (thay PID)
taskkill /PID <PID> /F
  ```

### ❌ `pnpm install` lỗi

```bash
# Xóa cache và thử lại
pnpm store prune
rm -rf node_modules
pnpm install
```

### ❌ Lỗi `EACCES` hoặc permission denied (macOS/Linux)

```bash
sudo chown -R $(whoami) ~/.pnpm-store
```

---

## 📁 Cấu trúc dự án

```
Websitebuilder/
├── dist-electron/          # Electron main process (compiled)
│   └── main.cjs            # Entry point cho Electron
├── HealthLinkDB/           # Database scripts
│   └── HEALTHLINK_DB.sql   # Script tạo database
├── HealthLinkJava/         # Backend Spring Boot
│   ├── pom.xml             # Maven dependencies
│   └── src/                # Source code Java
├── src/                    # Frontend React + TypeScript
├── index.html              # HTML entry point
├── package.json            # Node.js dependencies & scripts
├── pnpm-workspace.yaml     # pnpm workspace config
├── vite.config.ts          # Vite configuration
├── postcss.config.mjs      # PostCSS configuration
```

---

## 📄 License

Xem file [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) để biết thông tin về các thư viện bên thứ ba được sử dụng.