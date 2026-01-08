# Dashboard ga Kirish Qo'llanmasi

## ❌ Muammo: Dashboard ga o'tib bo'lmayapti

Dashboard sahifasiga faqat **admin** va **operator** rollaridagi foydalanuvchilar kira oladi.

## ✅ Yechim: Admin user bilan kirish

### 1. **Default Admin Credentials**
Backend da allaqachon default admin user yaratilgan:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

### 2. **Login Jarayoni**

1. **Login sahifasiga o'ting**: `/login`
2. **Admin credentials kiriting**:
   - Foydalanuvchi nomi: `admin`
   - Parol: `admin123`
3. **"To'ldirish" tugmasini bosing** - avtomatik to'ldirish uchun
4. **"Kirish" tugmasini bosing**

### 3. **Debugging Ma'lumotlari**

Login jarayonida console da quyidagi ma'lumotlar ko'rinadi:
- API connection status
- User role information
- Authentication success/failure
- Redirect logic

### 4. **Role-based Access**

- **Admin/Operator**: `/dashboard` sahifasiga yo'naltiriladi
- **Customer/Carrier**: `/profile` sahifasiga yo'naltiriladi

## 🔧 Qo'shimcha Debugging

Agar muammo davom etsa:

1. **Browser Console ni oching** (F12)
2. **Network tab ni tekshiring** - API so'rovlar muvaffaqiyatli bo'lyaptimi
3. **Console tab da xatoliklarni ko'ring**
4. **Application tab da token mavjudligini tekshiring**

## 📋 Tekshirish Ro'yxati

- ✅ Backend server ishlab turibdi (`https://logistik-pro.onrender.com/api/health`)
- ✅ Admin user mavjud (username: admin, password: admin123)
- ✅ Login component API connection test qiladi
- ✅ Dashboard component error handling bilan yangilandi
- ✅ ProtectedRoute component role checking bilan yangilandi

## 🚀 Natija

Admin credentials bilan login qilgandan so'ng, dashboard sahifasiga muvaffaqiyatli o'tish mumkin bo'ladi.