# Kitchen Rally

Game pickleball 1v1 (đánh đơn) chạy ngay trên trình duyệt, dựng 3D low-poly isometric như một mô hình đảo nổi: sân xanh dương, nhà câu lạc bộ mái đỏ, khán đài có mái che, hàng thông, hàng rào và bảng điểm điện tử.

Toàn bộ game nằm trong **một file `index.html`** (HTML + CSS + JS), dùng Three.js r160 nạp từ CDN unpkg. Không cần build, không cần asset ngoài.

## Cách chạy

Cần mạng để tải Three.js từ CDN. Mở bằng một server tĩnh (mở thẳng file:// có thể bị chặn ES module):

```bash
npx serve
# hoặc
python3 -m http.server 8000
```

Sau đó mở địa chỉ hiển thị (ví dụ http://localhost:3000 hoặc http://localhost:8000). Có thể deploy thẳng lên GitHub Pages hoặc Vercel, không cần cấu hình.

## Điều khiển

| Phím | Tác dụng |
| --- | --- |
| WASD / phím mũi tên | Di chuyển (mặc định theo hướng sân: Lên = về phía lưới) |
| J hoặc Space | Đánh mạnh (drive); khi giao bóng là giao nhanh |
| K | Đánh nhẹ: dink khi đứng gần vạch bếp, lob khi đứng sâu; khi giao bóng là giao nhẹ |
| Enter | Bắt đầu / tạm dừng / tiếp tục |
| M | Bật tắt âm thanh |
| C | Đổi kiểu điều khiển: theo sân hoặc theo màn hình |
| Q | Thoát về màn hình chính (khi đang tạm dừng) |

Trên điện thoại: cần joystick bên trái, hai nút HIT và SOFT bên phải (tự hiện trên thiết bị cảm ứng, hoặc thêm `?touch=1` vào URL để thử).

Auto-aim kiểu NES Tennis: giữ hướng lúc chạm bóng để chỉnh cú đánh (trái/phải = góc, lên = sâu hơn, xuống = ngắn hơn). Chạm bóng sớm hoặc muộn cũng làm lệch góc. Có bộ đệm phím 150 ms, và chỉ đánh được khi bóng nằm trong tầm vợt và độ cao hợp lý. Tự chọn thuận tay hoặc trái tay theo bên bóng.

## Luật tóm tắt (đánh đơn)

- **Giao bóng:** giao bóng thấp tay (underhand) từ sau vạch cuối sân, chéo sang ô giao bóng đối diện. Bóng phải qua khỏi vùng bếp (rơi trúng bếp, kể cả vạch bếp, là lỗi). Chỉ có một lần giao, bóng chạm lưới rồi vào ô vẫn chơi tiếp (let).
- **Ô giao bóng:** điểm của người giao chẵn thì đứng ô phải, lẻ thì đứng ô trái.
- **Luật hai nảy (two-bounce):** quả giao phải nảy một lần rồi người nhận mới đánh, quả trả cũng phải nảy một lần rồi bên giao mới đánh. Sau đó mới được đánh volley.
- **Luật bếp (kitchen):** vùng không volley rộng 7 ft (2,13 m) sát lưới. Không được volley khi đang đứng trong bếp hoặc chạm vạch bếp, và cũng không được lao vào bếp sau khi volley khi bóng chưa nảy. Được vào bếp để đánh bóng đã nảy.
- **Lỗi:** bóng ra ngoài, vào lưới, không qua lưới, volley trong bếp, vi phạm hai nảy, bóng nảy hai lần bên mình.
- **Tính điểm side-out:** chỉ bên giao bóng được điểm. Bên giao mắc lỗi thì mất quyền giao (side out), không ai được điểm. Điểm hiển thị dạng "điểm người giao - điểm người nhận".
- **Thắng game:** 11 điểm, hơn ít nhất 2 điểm. Trận đấu tối đa 3 game (thắng 2 game). Hiện thông báo FAULT, KITCHEN!, OUT, NET, SIDE OUT, GAME POINT, GAME, MATCH.

## AI

Ba mức Easy, Normal, Hard (khác tốc độ chạy, độ trễ phản ứng, sai số cú đánh). AI dự đoán điểm rơi bằng mô phỏng quỹ đạo, đứng sâu cho tới cú thứ ba rồi tiến lên vạch bếp, dink khi ở lưới, drive khi bạn đứng sâu, thỉnh thoảng lob. AI tuân thủ luật bếp, chỉ ở mức Easy mới thỉnh thoảng phạm lỗi bếp.

## Kiểm thử

```bash
node tests/rules.test.js
```

Chạy các kiểm tra logic luật (ô giao bóng theo điểm chẵn lẻ, side-out, hai nảy, bếp, double bounce, thắng game hơn 2 điểm, best of 3) và vật lý (bắn bóng vào đúng điểm, va chạm lưới). Các tham số cân chỉnh nằm hết trong object `CONFIG` ở đầu phần script.

## Cấu trúc code (trong index.html)

CONFIG, Rules, Ball (vật lý tự viết, bước cố định 120 Hz), Input, AudioFX (WebAudio), Batch + Venue (đảo, sân, nhà, khán đài, cây bằng geometry gộp), CameraRig (orthographic isometric), Player, AIController, HUD, Game (máy trạng thái + vòng lặp).
