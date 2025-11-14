# Admin API Examples

## Authentication
ต้อง login ด้วย admin account ก่อน และใช้ access token ใน header

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Response จะได้ accessToken มาใช้ในการเรียก API ต่อไป
```

## Dashboard Stats

```bash
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "data": {
    "stats": {
      "userCount": 2,
      "projectCount": 2
    },
    "recentUsers": [...],
    "recentProjects": [...]
  }
}
```

## Get All Users

```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Create User

```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "somchai@example.com",
    "password": "password123",
    "phoneNumber": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "gender": "MALE",
    "level": "Senior",
    "accountType": "EMPLOYEE"
  }'
```

## Update User

```bash
curl -X PUT http://localhost:3000/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "สมชาย",
    "lastName": "ใจดีมาก",
    "phoneNumber": "0898765432",
    "level": "Manager"
  }'
```

Note: ไม่จำเป็นต้องส่งทุกฟิลด์ ส่งเฉพาะที่ต้องการแก้ไข

## Delete User

```bash
curl -X DELETE http://localhost:3000/admin/users/USER_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Field Descriptions

### Gender
- `MALE` - ชาย
- `FEMALE` - หญิง
- `OTHER` - อื่นๆ

### Account Type
- `ADMINISTRATOR` - ผู้ดูแลระบบ (สามารถเข้าถึง admin panel)
- `EMPLOYEE` - พนักงานทั่วไป

### Required Fields (Create)
- `firstName` - ชื่อ (required)
- `lastName` - นามสกุล (required)
- `email` - อีเมล (required, unique)
- `password` - รหัสผ่าน (required)

### Optional Fields
- `phoneNumber` - เบอร์โทรศัพท์
- `address` - ที่อยู่
- `gender` - เพศ (default: null)
- `level` - ระดับตำแหน่ง (เช่น Junior, Senior, Manager)
- `accountType` - ประเภทบัญชี (default: EMPLOYEE)

## Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "message": "กรุณาเข้าสู่ระบบ",
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "message": "ไม่มีสิทธิ์เข้าถึง",
    "code": "FORBIDDEN"
  }
}
```

### 400 Bad Request
```json
{
  "error": {
    "message": "อีเมลนี้ถูกใช้งานแล้ว",
    "code": "EMAIL_EXISTS"
  }
}
```

### 404 Not Found
```json
{
  "error": {
    "message": "ไม่พบผู้ใช้",
    "code": "USER_NOT_FOUND"
  }
}
```
