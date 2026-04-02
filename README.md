# Oil Price Dashboard

เว็บแสดงราคาน้ำมันที่รวมข้อมูลจากบางจากและ PTT/OR ผ่าน API ของแอปตัวเอง พร้อมโครง deploy ไป Fly.io ผ่าน GitHub Actions

## ตอนนี้รองรับอะไรบ้าง

- บางจาก: ดึงจาก official web service โดยตรงที่ `https://oil-price.bangchak.co.th/ApiOilPrice2/th`
- PTT / OR: มี adapter เตรียมไว้แล้ว แต่ต้องกำหนด `PTT_API_URL` ให้ชี้ไปยัง endpoint หรือ embeddable page ของทาง PTT/OR ที่คุณต้องการใช้
- Frontend: อ่านข้อมูลจาก `/api/prices`
- Deploy: มี `Dockerfile`, `fly.toml` และ `.github/workflows/fly.yml`

## Run local

```bash
node server.js
```

หรือถ้าต้องการ auto reload:

```bash
npm run dev
```

เปิดที่ `http://localhost:3000`

## Environment variables

| Name | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | พอร์ตของแอป |
| `CACHE_TTL_MS` | `300000` | ระยะเวลา cache ฝั่ง server |
| `BANGCHAK_API_URL` | `https://oil-price.bangchak.co.th/ApiOilPrice2/th` | เปลี่ยนปลายทางบางจากได้ถ้าต้องการ |
| `PTT_API_URL` | empty | ปลายทาง PTT/OR ที่จะให้ parser อ่าน |

## Deploy to Fly.io ผ่าน GitHub

1. สร้าง Git repository แล้ว push ขึ้น GitHub
2. บนเครื่อง local รัน `fly launch --no-deploy` แล้วแก้ `app` ใน `fly.toml` ให้เป็นชื่อแอปจริงของคุณ
3. สร้าง deploy token ด้วย `fly tokens create deploy -x 999999h`
4. เพิ่ม secret ชื่อ `FLY_API_TOKEN` ใน GitHub repository
5. push เข้า branch `main` เพื่อให้ workflow deploy อัตโนมัติ

## หมายเหตุเรื่อง PTT / OR

ระหว่างการเตรียมโปรเจกต์นี้ พบ official web service ของบางจากแบบเปิดสาธารณะชัดเจน แต่ยังไม่พบหน้าเอกสาร API สาธารณะของ PTT/OR จากการค้นต้นทางที่เช็กในรอบนี้ จึงออกแบบระบบให้ adapter ฝั่ง PTT รองรับทั้ง JSON และ HTML table เพื่อเสียบ endpoint จริงได้ทันทีเมื่อคุณมี URL ที่ต้องการใช้
