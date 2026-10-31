# Kitchen Rally

Game pickleball 1v1 (đánh đơn) chạy ngay trên trình duyệt, dựng 3D low-poly. Màn hình chính và màn kết thúc hiện góc isometric như một mô hình đảo nổi: sân xanh dương, nhà câu lạc bộ mái đỏ, khán đài có mái che, hàng thông, hàng rào và bảng điểm điện tử.

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

Khi đang chơi, camera đặt sau vạch cuối sân của bạn, nhìn dọc sân kiểu NES Tennis (không xoay, lưới nằm ngang màn hình, bạn ở dưới, CPU ở trên). Điều khiển theo đúng màn hình: Lên = về phía lưới, Xuống = lùi, Trái/Phải = trái/phải trên màn hình.

| Phím | Tác dụng |
| --- | --- |
| WASD / phím mũi tên | Di chuyển (Lên = về phía lưới, Trái/Phải theo màn hình) |
| J hoặc Space | Đánh mạnh (drive); khi giao bóng là giao nhanh. Giữ phím để tự đánh khi bóng vào tầm vợt |
| K | Đánh nhẹ: dink khi đứng gần vạch bếp, lob khi đứng sâu; khi giao bóng là giao nhẹ. Giữ phím cũng tự đánh |
| T | Bật tắt hỗ trợ di chuyển (Assist, mặc định BẬT). Cũng bấm được nút ASSIST trên HUD |
| R | Bật tắt Rule Helper (mặc định BẬT ở Easy và Normal, TẮT ở Hard). Cũng bấm được nút trên HUD |
| Con lăn chuột / chụm hai ngón | Phóng to thu nhỏ camera trong giới hạn |
| Enter | Bắt đầu / tạm dừng / tiếp tục |
| M | Bật tắt âm thanh |
| Q | Thoát về màn hình chính (khi đang tạm dừng) |

Phím A đã dùng để chạy sang trái nên phím bật tắt Assist là **T**. Phím C (đổi kiểu điều khiển) đã bỏ vì camera sau vạch cuối làm hai kiểu giống nhau.

Trên điện thoại: cần joystick bên trái, hai nút HIT và SOFT bên phải (tự hiện trên thiết bị cảm ứng, hoặc thêm `?touch=1` vào URL để thử). Dọc màn hình thì sân phủ kín chiều ngang.

### Cảm giác di chuyển kiểu arcade

- Nhân vật đạt tốc độ tối đa 7,2 m/s sau khoảng 0,08 s và dừng gần như tức thì (giảm tốc 160 m/s²). Lúc vung vợt chỉ chậm xuống 75% tốc độ.
- Tầm vợt rộng 1,65 m, cao từ mặt đất đến 2,4 m, hồi chiêu giữa hai cú 0,22 s.
- Assist: khi bóng của đối thủ đang bay về phía bạn, nhân vật tự chạy về điểm đón bóng, trộn khoảng 40% với phím bạn bấm. Bấm hướng nào thì bạn vẫn là người quyết định, tắt bằng phím T.
- Bộ đệm phím 200 ms: bấm đánh hơi sớm vẫn được tính. Giữ J/Space (hoặc K) thì game tự vung ngay khi bóng vào tầm vợt.
- Auto-aim kiểu NES Tennis: giữ hướng lúc chạm bóng để chỉnh cú đánh (trái/phải = góc, lên = sâu hơn, xuống = ngắn hơn). Chạm bóng sớm hoặc muộn cũng làm lệch góc. Chỉ đánh được khi bóng nằm trong tầm vợt và độ cao hợp lý. Tự chọn thuận tay hoặc trái tay theo bên bóng.
- Bóng của AI chậm hơn và có độ vòng cao hơn, nhất là ở Easy và Normal (Hard gần như giữ tốc độ cũ).

### Lỗi công bằng và dễ hiểu

- **Tự động đánh không bao giờ gây lỗi luật:** bộ đệm phím 200 ms, giữ phím đánh (auto-swing) và Assist đều chờ tới khi đánh hợp lệ. Khi luật hai nảy yêu cầu bóng phải nảy (đỡ giao bóng, hoặc cú thứ ba của bên giao), hoặc khi bạn đang đứng trong bếp mà bóng chưa nảy, game sẽ không vung vợt cho bạn. Chỉ một lần bấm phím đánh rõ ràng đúng lúc bóng đã trong tầm vợt mới có thể phạm lỗi luật (luật thật vẫn giữ nguyên).
- **Rule Helper (R):** khi bật, lần bấm đánh phạm luật sẽ bị chặn (hiện chữ cảnh báo) thay vì bị xử lỗi. Sau cú volley gần bếp, nhân vật cũng không bị đẩy vào bếp do quán tính. Tắt ở Hard để chơi đúng luật 100%.
- **Gợi ý trực quan:** vòng đỏ và chữ LET IT BOUNCE trên bóng khi bóng bắt buộc phải nảy; vùng bếp phía bạn sáng đỏ (kèm chữ NO VOLLEY IN THE KITCHEN) khi bạn đứng trong bếp mà volley sẽ phạm luật.
- **Lý do lỗi rõ ràng:** sau mỗi lỗi hiện khoảng 2 giây dòng giải thích, ví dụ "Two-bounce rule: let the return bounce", "Kitchen volley", "Serve in kitchen", "Out", "Net".
- **Giao bóng an toàn:** mặc định giao vào giữa ô giao bóng, đủ sâu qua bếp. Ô giao bóng được tô vàng và có vòng ngắm; giữ hướng để dịch điểm ngắm (trái/phải, lên = sâu hơn).
- Auto-aim luôn giữ điểm ngắm trong vạch biên, nên cú đánh của bạn không tự bay ra ngoài.

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

CONFIG, Rules, Ball (vật lý tự viết, bước cố định 120 Hz), Input, AudioFX (WebAudio), Batch + Venue (đảo, sân, nhà, khán đài, cây bằng geometry gộp), CameraRig (một PerspectiveCamera, trộn mượt giữa góc đảo isometric và góc sau vạch cuối sân khi chơi), Player, AIController, HUD, Game (máy trạng thái + vòng lặp).

## Ảnh chụp

Xem thư mục `shots/` (title, transition, game, rally_closeup, mobile_portrait, mobile_landscape, cue_bounce, cue_kitchen, fault_reason, serve_target).
