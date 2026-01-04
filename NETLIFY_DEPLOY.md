# Netlify'ga Deploy Qilish

## Vercel Muammosi Hal Bo'lmasa

### 1. Netlify Account Yarating
1. https://netlify.com ga kiring
2. GitHub bilan sign up qiling

### 2. Site Deploy Qiling
1. "New site from Git" tugmasini bosing
2. GitHub repository'ni tanlang
3. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

### 3. Environment Variables
Site settings > Environment variables:
```
VITE_API_URL=https://logistik-pro.onrender.com
```

### 4. Deploy Qiling
"Deploy site" tugmasini bosing

### 5. Custom Domain (Ixtiyoriy)
Site settings > Domain management > Add custom domain

## Yoki Manual Deploy

```bash
# Netlify CLI o'rnatish
npm install -g netlify-cli

# Login qilish
netlify login

# Deploy qilish
netlify deploy --prod --dir=dist
```

## Test Qilish

Deploy tugaganidan so'ng:
1. Netlify URL'ni oching
2. Browser console'da xatoliklar yo'qligini tekshiring
3. Login/Register ishlashini sinab ko'ring

## Netlify vs Vercel

**Netlify afzalliklari:**
- Vite bilan yaxshi ishlaydi
- MIME type muammolari kam
- Sodda konfiguratsiya
- Tezroq deploy

**Vercel muammolari:**
- React 19 va Vite 5 bilan muammolar
- MIME type xatoliklari
- Murakkab konfiguratsiya kerak