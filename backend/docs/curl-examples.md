# Auth API cURL Examples

> ตั้งค่า `API=http://localhost:4000` และ `EMAIL=user@example.com` ก่อนรันคำสั่ง (หรือแก้ค่าในคำสั่งโดยตรง)

> ตัวอย่างบางส่วนใช้ `jq` เพื่อดึงค่า access token หากไม่มีสามารถคัดลอก token จาก response ได้เช่นกัน

```bash
API=http://localhost:4000
EMAIL=user@example.com
PASSWORD='P@ssw0rd!'
```

## Register
```bash
curl -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo User",
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }'
```

## Verify Email
```bash
curl -X POST "$API/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'",
    "code": "123456"
  }'
```

## Resend OTP
```bash
curl -X POST "$API/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$EMAIL'"
  }'
```

## Login (store refresh cookie)
```bash
curl -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'"
  }'
```

## Me (requires access token)
```bash
# รัน login แล้วคัดลอก accessToken จาก response (หรือใช้ jq หากติดตั้ง)
ACCESS_TOKEN="$(jq -r '.data.accessToken' <<<"$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"'$EMAIL'","password":"'$PASSWORD'"}' )")"

curl -X GET "$API/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Refresh Access Token (uses cookie jar from login)
```bash
curl -X POST "$API/auth/refresh" \
  -b cookies.txt \
  -c cookies.txt
```

## Logout
```bash
curl -X POST "$API/auth/logout" \
  -b cookies.txt
```

> หมายเหตุ: ไฟล์ `cookies.txt` จะเก็บ refresh token (เป็น httpOnly cookie) สำหรับการทดสอบในเครื่อง
