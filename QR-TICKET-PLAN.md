# Kế hoạch triển khai QR vé có chữ ký (HMAC / JWT HS256)

> Trạng thái: **Đã chốt — chờ triển khai code**.  
> Yêu cầu: dừng ở mức plan, chưa viết code.

---

## 1. Mục tiêu

Thay đổi cơ chế QR vé từ dạng **hash SHA-256 không có chữ ký** sang **JWT ký HMAC-SHA256** bằng secret key riêng của từng sự kiện.

Kết quả mong muốn:

- QR không thể bị giả mạo nếu không có secret của sự kiện.
- Backend verify được QR đó thuộc về vé, hạng vé, đơn hàng và sự kiện nào.
- QR tự động hết hạn khi sự kiện kết thúc.
- Chỉ nhân viên soát vé được admin assign mới có quyền check-in cho sự kiện đó.

---

## 2. Các quyết định đã chốt

| STT | Nội dung | Quyết định |
|---|---|---|
| 1 | Thuật toán ký QR | **JWT HS256** (đã có sẵn JJWT trong project) |
| 2 | Secret key | Một key riêng cho mỗi event, sinh khi admin duyệt event |
| 3 | Thờ i hết hạn QR | `exp = event.endTime` |
| 4 | Phân quyền checker | Admin assign danh sách checker cho event sau khi duyệt. Check-in verify checker thuộc `event_checkers` |
| 5 | API cho checker | Có API để checker xem các sự kiện mình được assign |
| 6 | Vé cũ (nếu có) | Viết job backfill sinh secret key + regenerate QR cho vé đã thanh toán. Nếu không có dữ liệu cũ thì job chạy không tác động gì |

---

## 3. Payload JWT đề xuất

JWT payload (claims):

| Claim | Kiểu | Bắt buộc | Ý nghĩa |
|---|---|---|---|
| `v` | number | Có | Version của QR format. Bắt đầu từ `1` |
| `sub` | string | Có | Ticket ID |
| `eid` | number | Có | Event ID — dùng để load event và chọn secret key |
| `ttid` | number | Có | Ticket Type ID |
| `oid` | number | Có | Order ID |
| `odid` | number | Có | Order Detail ID — bind vé với dòng đơn hàng |
| `iat` | number | Có | Thờ i phát hành QR, epoch seconds |
| `jti` | string | Có | Unique ID của QR, random 16 bytes, base64url |
| `exp` | number | Có | Thờ i hết hạn QR. `exp = event.endTime` |

Ví dụ payload:

```json
{
  "v": 1,
  "sub": "345",
  "eid": 12,
  "ttid": 7,
  "oid": 890,
  "odid": 891,
  "iat": 1760000000,
  "jti": "3f9c2a7e8b1d4c6f",
  "exp": 1760036000
}
```

**Không đưa vào payload:**

- Giá vé
- Tên hạng vé / tên sự kiện
- Email, số điện thoại, thông tin cá nhân khách
- Bất kỳ dữ liệu nào không cần thiết cho việc xác thực

Những thông tin trên sẽ lấy từ DB tại thờ i check-in.

---

## 4. Secret key của sự kiện

### 4.1. Sinh key

- Sinh bằng `SecureRandom` 32 bytes.
- Encode Base64 URL-safe, không padding → khoảng 43 ký tự.
- Chỉ sinh **một lần duy nhất** khi admin duyệt event (`EventService.publishEvent`).
- Nếu event đã có `secret_key` thì giữ nguyên, không sinh lại — tránh làm vô hiệu toàn bộ vé đã phát hành.

### 4.2. Lưu trữ

- Thêm cột `secret_key VARCHAR(64)` vào bảng `events`.
- Không trả `secret_key` ra bất kỳ API nào.
- Thêm `@JsonIgnore` và ignore trong MapStruct mapper để tránh lộ.

---

## 5. Luồng sinh QR

### 5.1. Tạo service dùng chung

Tạo `ticketing/service/TicketQrService.java` với các method:

- `String generate(Ticket ticket, Order order, Event event)`
- `TicketQrPayload verify(String token, Event event)`
- `Long parseEventId(String token)` — đọc `eid` từ payload chưa verify

### 5.2. Thay thế nơi sinh QR hiện tại

Hiện tại QR đang được sinh ở 2 nơi:

- `orders/service/OrderService.java` → `generateQrCode(...)`
- `finance/payment/sepay/SePayPaymentProvider.java` → `generateQrCode(...)`

Cả 2 nơi sẽ gọi `TicketQrService.generate(...)`.

### 5.3. Bước sinh QR

```text
1. Load event của order.
2. Nếu event.secretKey == null → lỗi (không nên xảy ra nếu publish đã sinh key).
3. Build JWT với các claim ở mục 3.
4. Ký bằng HS256 với event.secretKey.
5. Lưu chuỗi JWT vào tickets.qr_code.
```

---

## 6. Luồng check-in

API: `POST /api/v1/check-in`  
Yêu cầu: user có role `CHECKER`.

### 6.1. Các bước xử lý

```text
1. Nhận raw QR token từ request.
2. Parse unverified để lấy eventId (eid).
3. Load event theo eventId.
4. Kiểm tra event.status == ONGOING.
   - Nếu không → error.checkin.event-not-ongoing
5. Kiểm tra checkerUserId (từ @AuthenticationPrincipal) có trong event_checkers của event không.
   - Nếu không → error.checkin.not-assigned
6. Verify JWT signature bằng event.secretKey.
   - JWT tự động reject nếu exp < now.
   - Sai chữ ký → error.checkin.invalid-signature
7. Lấy ticketId từ claim sub.
8. Load ticket theo ticketId.
9. Đối chiếu:
   - ticket.eventId == eid
   - ticket.ticketTypeId == ttid
   - ticket.orderDetailId == odid
10. Kiểm tra ticket.status:
    - PAID → hợp lệ
    - USED → error.ticket.already-used
    - Khác PAID → error.ticket.not-paid
11. Update ticket.status = USED với điều kiện status = 'PAID' (tránh race condition).
12. Trả về thông tin check-in.
```

### 6.2. Các lỗi cần định nghĩa

| Key | Ý nghĩa |
|---|---|
| `error.checkin.invalid-qr` | QR sai format |
| `error.checkin.invalid-signature` | Sai chữ ký JWT |
| `error.checkin.event-not-ongoing` | Sự kiện chưa diễn ra hoặc đã kết thúc |
| `error.checkin.not-assigned` | Nhân viên không được phân quyền soát vé sự kiện này |
| `error.checkin.ticket-event-mismatch` | Vé không thuộc sự kiện trong QR |
| `error.ticket.not-found` | Không tìm thấy vé |
| `error.ticket.already-used` | Vé đã được sử dụng |
| `error.ticket.not-paid` | Vé chưa được thanh toán |

---

## 7. Phân quyền checker cho sự kiện

Bảng `event_checkers` đã có trong DB:

```sql
CREATE TABLE event_checkers (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checker_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, checker_id)
);
```

### 7.1. Cần bổ sung

- Entity `EventChecker.java`
- Repository `EventCheckerRepository.java` với method `existsByEventIdAndCheckerId(Long eventId, Long checkerId)`
- API admin để assign/gỡ/list checker:

```text
POST   /api/v1/admin/events/{eventId}/checkers        // assign checker
DELETE /api/v1/admin/events/{eventId}/checkers/{userId}  // gỡ checker
GET    /api/v1/admin/events/{eventId}/checkers        // xem danh sách
```

- API cho checker:

```text
GET /api/v1/checkers/my-events   // xem sự kiện mình được assign
```

### 7.2. Quy tắc assign

- Chỉ user có role `CHECKER` mới được assign.
- Chỉ admin mới được assign (theo convention `/api/v1/admin/**`).
- Sau khi admin duyệt event (`PENDING_REVIEW` → `PUBLISHED`), admin sẽ assign danh sách checker.

---

## 8. Vòng đờ i sự kiện & scheduler

Đã có scheduler chuyển `PUBLISHED` → `ONGOING` khi `startTime <= now`.

Cần bổ sung scheduler thứ hai:

```text
@Scheduled(cron = "0 */5 * * * *")
closeFinishedEvents()
```

Nhiệm vụ:

- Tìm event đang `ONGOING` có `endTime <= now`.
- Chuyển sang `CLOSED`.
- Kết hợp với `exp = endTime` trong JWT, đảm bảo sau khi sự kiện kết thúc không thể check-in.

---

## 9. Migration & backfill

### 9.1. Migration mới

`V34__add_event_secret_key_and_expand_ticket_qr.sql`:

```sql
ALTER TABLE events ADD COLUMN secret_key VARCHAR(64);
ALTER TABLE tickets ALTER COLUMN qr_code TYPE VARCHAR(1024);
```

### 9.2. Backfill dữ liệu cũ

Viết một job một lần (có thể là `ApplicationRunner` hoặc admin endpoint):

```text
1. Tìm các event có secret_key IS NULL → sinh key cho từng event.
2. Tìm các vé PAID có qr_code là QR cũ (không phải JWT) → regenerate QR JWT mới.
```

Nếu chưa có dữ liệu cũ, job chạy xong mà không tác động gì.

### 9.3. Lưu ý

- Không edit các migration đã apply.
- Cột `secret_key` có thể để nullable trong migration; backfill sẽ điền dần.

---

## 10. Các file dự kiến thay đổi / tạo mới

### Entity / DB

- `events/entity/Event.java` — thêm `secretKey`
- `events/entity/EventChecker.java` — entity mới
- `events/repository/EventCheckerRepository.java` — repository mới
- `ticketing/entity/Ticket.java` — mở rộng `qrCode` length (hoặc để Hibernate tự sync từ migration)
- `db/migration/V34__add_event_secret_key_and_expand_ticket_qr.sql`

### Service

- `ticketing/service/TicketQrService.java` — **mới**, generate/verify JWT
- `events/service/EventService.java` — sinh secret key trong `publishEvent`
- `orders/service/OrderService.java` — dùng `TicketQrService` thay vì `generateQrCode` cũ
- `finance/payment/sepay/SePayPaymentProvider.java` — dùng `TicketQrService`
- `operations/service/CheckInService.java` — verify JWT + checker + ticket
- `events/service/EventCheckerService.java` — **mới**, assign/gỡ/list checker
- Job backfill (tùy chọn tách riêng hoặc để trong service)

### Scheduler

- `events/job/EventEndScheduler.java` — **mới**, chuyển `ONGOING` → `CLOSED`

### Controller

- `operations/controller/CheckInController.java` — cập nhật hoặc giữ nguyên endpoint
- `events/controller/AdminEventController.java` — bổ sung API assign checker
- `operations/controller/CheckerController.java` — **mới**, `GET /api/v1/checkers/my-events`

### DTO

- `operations/dto/response/CheckInResponse.java` — giữ nguyên/cập nhật
- `events/dto/request/AssignCheckerRequest.java` — **mới**
- `events/dto/response/EventCheckerResponse.java` — **mới**

### Mapper

- `events/mapper/EventMapper.java` — ignore `secretKey`

### i18n

- `i18n/messages.properties`
- `i18n/messages_vi.properties`
- `i18n/messages_en.properties`

Thêm các key:

- `error.checkin.invalid-qr`
- `error.checkin.invalid-signature`
- `error.checkin.not-assigned`
- `error.checkin.ticket-event-mismatch`
- `error.event.secret-key-missing` (nếu cần)

### Config

- `EventTicketPlatformApplication.java` — `@EnableScheduling` đã có từ feature trước

---

## 11. Testing

### Unit test

- `TicketQrServiceTest`:
  - generate → verify thành công
  - sửa `tid`/`eid` trong payload → verify fail
  - dùng secret của event khác → verify fail
  - token malformed → parse fail
  - token hết hạn → verify fail

- `EventServiceTest`:
  - publish event sinh secret key đúng 1 lần
  - publish lần 2 không đổi key

- `CheckInServiceTest`:
  - check-in thành công → ticket chuyển USED
  - event không ONGOING → lỗi
  - checker không được assign → lỗi
  - vé đã USED → lỗi
  - vé chưa PAID → lỗi
  - 2 request check-in đồng thờ i → chỉ 1 thành công

### Integration test

- Chạy full flow: tạo event → publish → assign checker → mua vé → thanh toán → check-in.

---

## 12. Lưu ý bảo mật

- Không bao giờ trả `secret_key` ra API.
- Không log secret key.
- Không tin tưởng payload JWT chỉ vì có chữ ký — vẫn phải đối chiếu với DB.
- Dùng constant-time comparison khi verify HMAC (JJWT đã xử lý).
- Key rotation sẽ làm toàn bộ QR cũ vô hiệu; nếu cần rotate thì phải reissue vé.

---

## 13. Next step

Sau khi plan này được duyệt, chuyển sang agent code để triển khai.
