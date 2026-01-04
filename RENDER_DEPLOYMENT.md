# Render.com Deployment Guide

## 404 Error Hal Qilish

Agar `GET /api/profile 404 (Not Found)` xatolik chiqsa, quyidagi qadamlarni bajaring:

### 1. Backend Service Deploy Qilish

1. Render.com dashboard'ga kiring
2. "New" > "Web Service" tugmasini bosing
3. GitHub repository'ni ulang
4. Quyidagi sozlamalarni kiriting:

```
Name: logistics-pro-backend
Environment: Node
Build Command: cd backend && npm install
Start Command: cd backend && npm start
```

### 2. Environment Variables

Backend service uchun quyidagi environment variable'larni qo'shing:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=[32 ta belgidan iborat xavfsiz kalit]
BCRYPT_ROUNDS=12
```

JWT_SECRET yaratish uchun:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Frontend Service Deploy Qilish

1. "New" > "Static Site" tugmasini bosing
2. Quyidagi sozlamalarni kiriting:

```
Name: logistics-pro-frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### 4. Environment Variables (Frontend)

Frontend uchun:
```
VITE_API_URL=https://logistics-pro-backend.onrender.com
```

### 5. Custom Domain (Ixtiyoriy)

Agar custom domain ishlatmoqchi bo'lsangiz:
1. Backend: `api.yourdomain.com`
2. Frontend: `yourdomain.com`

## Troubleshooting

### Backend 404 Errors
1. Backend service running ekanligini tekshiring
2. Logs'ni tekshiring: Render dashboard > Service > Logs
3. Health check endpoint'ni sinab ko'ring: `https://your-backend.onrender.com/api/health`

### CORS Errors
Backend server.js faylida CORS konfiguratsiyasi to'g'ri sozlangan:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://logistics-pro-frontend.onrender.com', 'https://logistik-pro.onrender.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### Environment Variables
Render dashboard'da Environment Variables to'g'ri sozlanganligini tekshiring.

## Deployment Checklist

- [ ] Backend service yaratilgan
- [ ] Frontend static site yaratilgan
- [ ] Environment variables sozlangan
- [ ] JWT_SECRET xavfsiz kalit bilan sozlangan
- [ ] CORS to'g'ri konfiguratsiya qilingan
- [ ] Health check ishlayapti
- [ ] API endpoints javob berayapti

## Monitoring

Backend health check: `GET /api/health`
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-04T...",
  "version": "1.0.0"
}
```