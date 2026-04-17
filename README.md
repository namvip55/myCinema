# MyCinema 🎬

MyCinema là một ứng dụng phát video ngoại tuyến (offline video player) cao cấp được xây dựng bằng React Native và Expo. Ứng dụng mang lại trải nghiệm xem video mượt mà, tiện lợi và an toàn tuyệt đối trên thiết bị di động.

## ✨ Tính năng nổi bật

- **🎦 Trình phát video mạnh mẽ**: Dựa trên `expo-video` với khả năng xử lý mượt mà. Hỗ trợ tự động xoay màn hình (landscape/portrait) tối ưu cho việc trải nghiệm video.
- **🔒 Bảo mật sinh trắc học**: Tích hợp khóa ứng dụng bằng vân tay/FaceID (`expo-local-authentication`). Tính năng **Auto-lock** tự động kích hoạt khóa bảo vệ bất cứ khi nào ứng dụng được đưa vào chạy nền (background).
- **📂 Quản lý & Nhập video thông minh**: Hỗ trợ import video trực tiếp từ Thư viện ảnh (`expo-media-library`) hoặc ứng dụng Tệp (`expo-document-picker`) dễ dàng.
- **🔖 Highlight & Chuyển mốc thời gian**: Tính năng tạo nhanh các mốc quan trọng trong video và nhảy cóc (highlight jumping) theo thời gian thực một cách thông minh.
- **📴 Hoàn toàn ngoại tuyến**: Không yêu cầu internet. Mọi tính năng từ bảo mật, quản lý hay phát video đều xử lý offline nhằm bảo vệ quyền riêng tư.
- **🌙 Giao diện tối ưu (Dark Theme)**: Thiết kế giao diện Dark Mode xuyên suốt mang lại trải nghiệm xem phim chân thực như ngoài rạp.

## 🛠 Công nghệ sử dụng

- **Core**: [React Native](https://reactnative.dev/) v0.81.5 & [Expo](https://expo.dev/) v54
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) v6
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI & Animations**: `react-native-reanimated`, `react-native-gesture-handler`, `lucide-react-native`
- **Native Modules chính**: 
  - `expo-video`, `expo-media-library`, `expo-local-authentication`, `expo-screen-orientation`

## 🚀 Hướng dẫn cài đặt để phát triển

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản LTS mới nhất.
- **Môi trường**: Đã cài đặt Android Studio (cho Android) hoặc Xcode (cho iOS).

### 2. Các bước thiết lập

```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy dự án
npx expo start
```
- Nhấn phím `a` để mở ứng dụng trên Android Emulator.
- Nhấn phím `i` để mở ứng dụng trên iOS Simulator.
- Quét mã QR bằng ứng dụng quét mã mặc định (iOS) hoặc ứng dụng Expo Go (Android) để thử nghiệm trực tiếp trên điện thoại.

## 📦 Đóng gói ứng dụng (Build APK/IPA)

Dự án đã được cấu hình sẵn với EAS.

```bash
# Build file APK/AAB cho Android
eas build -p android --profile production

# Build cho iOS
eas build -p ios --profile production
```

## 📂 Tổ chức dự án

```text
d:\myCinema\
├── app/             # Nơi chứa các routes/màn hình dựa trên Expo Router
├── components/      # Các UI component có thể tái sử dụng (Player, Modal,...)
├── store/           # Cấu hình store của Zustand lưu trữ dữ liệu State
├── utils/           # Các hàm tiện ích (Format thời gian, xử lý file,...)
├── constants/       # Chứa các biến số mặc định như Colors, Layout
├── assets/          # Hình ảnh, fonts sử dụng trong quá trình code
├── public/          # App icon và splash screen
└── app.json         # Cấu hình meta và quyền Native cho Expo App
```

## 🔐 Quyền ứng dụng (Permissions)

Vì là trình phát video nội bộ, MyCinema yêu cầu một số quyền thiết yếu bao gồm:
- Đọc/Ghi bộ nhớ (để quản lý video gốc).
- Sinh trắc học (Sử dụng vân tay / FaceID để mở khóa app).
- Foreground Service (Để phát audio dưới nền).

---
*MyCinema - Gói gọn rạp phim trong túi của bạn* 🍿
