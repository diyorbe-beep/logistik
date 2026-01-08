# User Buyurtma Berish Qo'llanmasi

## ✅ Muammo Hal Qilindi

Oddiy userlar endi buyurtma bera oladi! Quyidagi o'zgarishlar amalga oshirildi:

### 🔧 **Amalga oshirilgan o'zgarishlar:**

1. **Backend User Role O'zgarishi:**
   - `ghost` userning roli `user` dan `customer` ga o'zgartirildi
   - Bu orqali buyurtma berish imkoniyati ochildi

2. **OrderForm Route Yangilandi:**
   - OrderForm endi `customer` va `user` rollaridagi userlar uchun ochiq
   - Layout wrapper olib tashlandi (to'g'ridan-to'g'ri OrderForm component)

3. **Home Sahifasi Yangilandi:**
   - Authenticated userlar uchun "Buyurtma berish" tugmasi qo'shildi
   - Non-authenticated userlar uchun "Register" va "Login" tugmalari
   - User holatiga qarab dinamik tugmalar

4. **Navbar Yangilandi:**
   - Authenticated userlar uchun "Buyurtma berish" linki qo'shildi
   - Desktop va mobile versiyalarda mavjud
   - Yangi btn-secondary styling qo'shildi

### 📋 **Buyurtma berish jarayoni:**

1. **Login qiling** (ghost user bilan yoki yangi customer user yarating)
2. **Home sahifasida** "Buyurtma berish" tugmasini bosing
3. **Yoki Navbar da** "Buyurtma berish" linkini bosing
4. **OrderForm** sahifasiga yo'naltirilasiz
5. **Buyurtma ma'lumotlarini** to'ldiring va yuboring

### 🎯 **User Role Tizimi:**

- **Admin/Operator**: Dashboard ga kirish + barcha funksiyalar
- **Customer/User**: Profile + Buyurtma berish
- **Carrier**: Profile + Yuk tashish

### 🔗 **Mavjud Linklar:**

- **Home sahifasi**: Authenticated userlar uchun "Buyurtma berish" tugmasi
- **Navbar**: "Buyurtma berish" linki (desktop va mobile)
- **Profile sahifasi**: "Yangi buyurtma berish" linki (customer uchun)
- **Direct URL**: `/orders/new`

### ✅ **Test Qilish:**

1. `ghost` user bilan login qiling
2. Home sahifasida "Buyurtma berish" tugmasini ko'ring
3. Navbar da "Buyurtma berish" linkini ko'ring
4. OrderForm sahifasiga o'ting va buyurtma bering

Endi barcha userlar buyurtma bera oladi!