# Deployment Guide - Vercel + Render.com

## Current Setup
- **Frontend**: https://logistik-dusky.vercel.app (Vercel)
- **Backend**: https://logistik-pro.onrender.com (Render.com)

## Hal Qilish Qadamlari

### 1. Backend'ni Render.com'da Redeploy Qiling
Backend'dagi CORS konfiguratsiyasi yangilandi. Render.com'da:
1. Dashboard > logistik-pro service
2. "Manual Deploy" > "Deploy Latest Commit" tugmasini bosing
3. Deploy tugaguncha kuting (2-3 daqiqa)

### 2. Frontend'ni Vercel'da Redeploy Qiling
1. Vercel dashboard'ga kiring
2. logistik project'ni toping
3. "Redeploy" tugmasini bosing
4. Yoki GitHub'ga push qiling (avtomatik deploy)

### 3. Environment Variables Tekshirish

#### Vercel'da (Frontend):
```
VITE_API_URL=https://logistik-pro.onrender.com
```

#### Render.com'da (Backend):
```
NODE_ENV=production
PORT=10000
JWT_SECRET=[32+ belgili xavfsiz kalit]
BCRYPT_ROUNDS=12
```

### 4. Tekshirish

1. **Backend health check:**
   ```
   https://logistik-pro.onrender.com/api/health
   ```
   
2. **Frontend'dan API'ga murojaat:**
   ```
   https://logistik-dusky.vercel.app
   ```

### 5. Debugging

Agar hali ham 404 error chiqsa:

1. **Browser Developer Tools'da Network tab'ni oching**
2. **Login yoki Profile sahifasiga o'ting**
3. **API request'larni kuzating**
4. **Agar CORS error bo'lsa - backend redeploy qiling**
5. **Agar 404 bo'lsa - backend service ishlamayapti**

### 6. Logs Tekshirish

#### Render.com Logs:
1. Dashboard > logistik-pro service > Logs
2. Server start va error message'larni ko'ring

#### Vercel Logs:
1. Dashboard > logistik project > Functions tab
2. Build va runtime logs'ni ko'ring

## Tezkor Test

Browser console'da test qiling:
```javascript
fetch('https://logistik-pro.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

Agar bu ishlasa, CORS muammosi hal bo'lgan.

## Keyingi Qadamlar

1. Backend'ni redeploy qiling
2. 5 daqiqa kuting (Render.com cold start)
3. Frontend'ni test qiling
4. Agar ishlamasa, logs'ni tekshiring