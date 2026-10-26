# 🌈 Bé Học Tiếng Anh

Web học tiếng Anh cho bé 2 tuổi: hình to, chạm là nghe, không chữ phức tạp, không quảng cáo.

## Có gì bên trong
- **11 chủ đề, ~120 từ**: Con vật, Màu sắc, Số đếm 1–10 (đếm to từng số), Hoa quả, Hình khối, Cơ thể, Cảm xúc (happy, sad, angry, sleepy…), Xe cộ, Đồ ăn, Đồ vật, Thiên nhiên.
- **📖 Học**: thẻ từ lớn, tự đọc khi mở; chạm thẻ để nghe lại, vuốt hoặc bấm ◀ ▶ để đổi; nút *Tự chạy* để máy tự lật thẻ.
- **🎯 Chơi**: mỗi bài 10 câu. Máy hỏi “Where is the dog?”, bé chạm đúng hình → pháo hoa + ⭐ (chạm hình không đọc gì, chỉ có âm thanh). Sai 2 lần thì hình đúng nhấp nháy gợi ý. Xong 10 câu có màn vỗ tay chúc mừng.
- **🎈 Bóng bay**: chạm bóng để nổ và nghe tên màu.
- **⚙️ Cài đặt cho bố mẹ** (giữ nút 1 giây để bé không bấm nhầm): bật/tắt tiếng Việt, tốc độ đọc, số hình khi chơi (2–4), giọng đọc, âm thanh hiệu ứng.

## Cách chạy
- Nhanh nhất: mở `index.html` bằng Chrome / Edge / Safari.
- Hoặc chạy máy chủ nhỏ (cần Node.js) để mở trên điện thoại/máy tính bảng cùng Wi-Fi:

```bash
node serve.js
```

Màn hình sẽ in ra địa chỉ dạng `http://192.168.x.x:5173` để gõ vào trình duyệt trên máy tính bảng.

## Lưu ý
- Giọng đọc dùng sẵn của trình duyệt (Web Speech API). Nếu không có tiếng, vào Cài đặt → chọn giọng khác. Trên Windows có thể thêm giọng English trong *Settings → Time & language → Speech*.
- Thêm từ mới: sửa `js/data.js` (mỗi từ gồm `en`, `vi`, `emoji`).
