# Face Recognition Application
## Bước 1: Khởi chạy node server
```
git clone https://github.com/Cuaconca/03-Demo-Face-Detect.git
cd 03-Demo-Face-Detect
npm install
npm start
```
## Bước 2: Khởi chạy môi trường cho android app

### Cài đặt Expo CLI
```
npm install -g expo-cli
```

### Kiểm tra phiên bản expo đã được cài đặt thành công hay chưa
```
expo --version
```

### Tạo dự án mới
```
expo init face-recognition-app
cd face-recognition-app
```

### Tiến hành chạy môi trường cho android app
```
npx expo start
```

## Bước 3: Build file APK

### 1. Đăng nhập vào Expo
```
expo login
```
### 2. Cài đặt EAS CLI
```
npm install -g eas-cli
```
### 3. Cấu hình dự án với EAS
```
eas build:configure
```
### 4. Build file APK
```
eas build -p android --profile preview
```
### 5. Đợi quá trình build hoàn tất
Quá trình build sẽ được thực hiện trên máy chủ của Expo. Bạn sẽ thấy tiến trình của quá trình build trên terminal. Sau khi build xong, bạn sẽ nhận được một đường link để tải file APK về.
