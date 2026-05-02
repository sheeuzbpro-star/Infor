# InforTest — Backend

## Loyiha tuzilmasi
```
informatika-backend/
├── server.js          ← Asosiy backend (Express + MongoDB)
├── models/
│   └── User.js        ← Foydalanuvchi modeli
├── public/
│   └── index.html     ← Frontend (backend bilan ulangan)
├── .env               ← Maxfiy sozlamalar (gitga yuklamang!)
├── .env.example       ← Namuna
├── render.yaml        ← Render.com sozlamalari
└── package.json
```

## Render.com ga deploy qilish

### 1. GitHub ga yuklash
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/SIZNING_USERNAME/informatika-backend.git
git push -u origin main
```

### 2. Render.com da yangi servis yaratish
1. https://render.com ga kiring
2. **New → Web Service** bosing
3. GitHub reponi tanlang
4. Quyidagilarni kiriting:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Environment Variables** bo'limida:
   - `MONGODB_URI` = sizning MongoDB URI
   - `JWT_SECRET` = maxfiy kalit
6. **Deploy** bosing ✅

## API Endpointlar
| Method | URL | Tavsif |
|--------|-----|--------|
| POST | /api/register | Ro'yxatdan o'tish |
| POST | /api/login | Kirish |
| GET | /api/me | Mening ma'lumotlarim |
| POST | /api/result | Natijani saqlash |
