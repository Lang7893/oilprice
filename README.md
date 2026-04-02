# Oil & Gold Dashboard

เว็บแสดงราคาน้ำมันและราคาทองคำที่รวมข้อมูลจากบางจากและสมาคมค้าทองคำ ผ่าน API ของแอปตัวเอง พร้อมโครง deploy ไป Fly.io ผ่าน GitHub Actions

## ตอนนี้รองรับอะไรบ้าง

- บางจาก: ดึงจาก official web service โดยตรงที่ `https://oil-price.bangchak.co.th/ApiOilPrice2/th`
- สมาคมค้าทองคำ: ดึงจาก endpoint `https://www.goldtraders.or.th/api/GoldPrices/details?readjson=false`
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
| `GOLD_API_URL` | `https://www.goldtraders.or.th/api/GoldPrices/details?readjson=false` | ปลายทางสมาคมค้าทองคำ |

## Deploy to Fly.io ผ่าน GitHub

1. สร้าง Git repository แล้ว push ขึ้น GitHub
2. บนเครื่อง local รัน `fly launch --no-deploy` แล้วแก้ `app` ใน `fly.toml` ให้เป็นชื่อแอปจริงของคุณ
3. สร้าง deploy token ด้วย `fly tokens create deploy -x 999999h`
4. เพิ่ม secret ชื่อ `FLY_API_TOKEN` ใน GitHub repository
5. push เข้า branch `main` เพื่อให้ workflow deploy อัตโนมัติ

## แหล่งข้อมูลที่ใช้

- บางจาก: `https://oil-price.bangchak.co.th/ApiOilPrice2/th`
- สมาคมค้าทองคำ: `https://www.goldtraders.or.th/api/GoldPrices/details?readjson=false`
