# Project Auth Stack

ระบบตัวอย่าง Authentication "Login/Register + Email OTP Verify" แยก Frontend/Backend พร้อมโค้ดพร้อมใช้งานในโปรดักชัน

## โครงสร้างโฟลเดอร์
```
project-managementTeam/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/env.js
│   │   ├── controllers/auth.controller.js
│   │   ├── services/auth.service.js
│   │   ├── routes/auth.routes.js
│   │   ├── middleware/{auth.js,error.js}
│   │   ├── lib/{prisma.js,mailer.js}
│   │   └── utils/{otp.js,jwt.js,password.js,rate.js,email.js,errors.js}
│   ├── prisma/schema.prisma
│   ├── docs/curl-examples.md
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/http.js
    │   ├── store/auth.js
    │   ├── router.jsx
    │   ├── App.jsx
    │   ├── styles/globals.css
    │   ├── utils/validators.js
    │   ├── components/
    │   │   ├── layout/{AuthLayout.jsx,ProtectedRoute.jsx}
    │   │   └── ui/{Button.jsx,Input.jsx,Card.jsx,Countdown.jsx,Toast.jsx,Spinner.jsx}
    │   └── pages/{Register.jsx,VerifyEmail.jsx,Login.jsx,Dashboard.jsx,NotFound.jsx}
    ├── vite.config.js
    └── package.json
```

## เตรียม Backend
1. ติดตั้ง dependencies
   ```bash
   cd backend
   npm install
   ```
2. สร้างไฟล์สิ่งแวดล้อม
   ```bash
   cp .env.example .env
   # แก้ค่า SMTP / JWT secret / DATABASE_URL ตามต้องการ
   ```
3. รัน Prisma migration + generate
   ```bash
   npx prisma migrate dev --name init
   ```
4. เปิดเซิร์ฟเวอร์
   ```bash
   npm run dev
   ```

> สำหรับการทดสอบอีเมลในเครื่อง แนะนำ MailHog / Mailpit (ตั้งค่าตาม SMTP_* ใน `.env`)

## เตรียม Frontend
1. ติดตั้ง dependencies
   ```bash
   cd frontend
   npm install
   ```
2. เปิดแอป
   ```bash
   npm run dev
   ```

ตั้งค่า `VITE_API_URL` ในไฟล์ `.env` ของ frontend หาก backend ไม่รันที่ `http://localhost:4000`

## การทดสอบ API
- มีตัวอย่างคำสั่งพร้อมใช้ทุก endpoint ใน `backend/docs/curl-examples.md`
- Postman collection สามารถนำคอมมานด์เหล่านี้ไปสร้าง request ได้ทันที (รองรับ refresh token ผ่าน cookie jar)

## ฟีเจอร์/ความปลอดภัยเด่น ๆ
- Argon2id hash รหัสผ่าน + OTP เก็บเฉพาะ hash
- OTP 6 หลักหมดอายุ 10 นาที ใช้ครั้งเดียว พร้อม cooldown ต่ออีเมล/IP
- JWT access 15 นาที + refresh 7 วัน (httpOnly secure cookie) พร้อม rotation & revoke
- Rate limit ต่อ IP สำหรับ Register/Login/OTP
- React + Vite + Tailwind Glassmorphism UI, React Hook Form + Zod validation real-time, Zustand global auth state, Axios interceptor รีเฟรช token อัตโนมัติ
- Toast feedback, loading states, password strength meter, resend OTP countdown

## สคริปต์สำคัญ
- Backend
  - `npm run dev` — รันเซิร์ฟเวอร์ Express ด้วย Nodemon
  - `npx prisma migrate dev` — สร้าง/ปรับปรุง schema และ DB
  - `npm run start` — รันเซิร์ฟเวอร์ในโหมด production
- Frontend
  - `npm run dev` — เปิด Vite dev server
  - `npm run build` — สร้าง production bundle

## ขั้นตอนการใช้งาน
1. Register ➜ ระบบส่ง OTP ไปยังอีเมล
2. Verify Email ➜ ป้อน OTP 6 หลัก (หรือกด resend หลัง cooldown)
3. Login ➜ รับ access token และ refresh cookie
4. Dashboard ➜ ดูข้อมูลผู้ใช้ (เฉพาะ verified) + logout ล้าง refresh token

พร้อมใช้งานเป็นฐานรากสำหรับระบบชื่อผู้ใช้/องค์กรอื่น ๆ ต่อไป
