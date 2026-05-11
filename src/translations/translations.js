export const translations = {
  uz: {
    // Navbar
    home: 'Bosh sahifa',
    login: 'Kirish',
    register: 'Ro\'yxatdan o\'tish',
    logout: 'Chiqish',
    
    // Home Page
    heroTitle: 'Logistics Pro',
    heroSubtitle: 'Professional Transport & Logistics Management System',
    heroDescription: 'Logistika operatsiyalarini bizning keng qamrovli yuk tashish kuzatuv va boshqaruv platformamiz bilan soddalashtiring. Yuk tashishlarni boshqaring, transport vositalarini kuzating va yetkazib berishlarni bitta joyda kuzating.',
    getStarted: 'Boshlash',
    keyFeatures: 'Asosiy xususiyatlar',
    shipmentManagement: 'Yuk tashish boshqaruvi',
    shipmentManagementDesc: 'Yaratishdan yetkazib berishgacha barcha yuk tashishlaringizni real vaqt rejimida status yangilanishlari bilan kuzating va boshqaring.',
    vehicleTracking: 'Transport vositalarini kuzatish',
    vehicleTrackingDesc: 'Avtopark transport vositalaringizni kuzating va ularni samarali logistika operatsiyalari uchun yuk tashishlarga tayinlang.',
    dashboardAnalytics: 'Dashboard tahlillari',
    dashboardAnalyticsDesc: 'Logistika operatsiyalaringiz bo\'yicha statistikalar va tahlillar bilan keng qamrovli tushunchalar oling.',
    statusTracking: 'Status kuzatuv',
    statusTrackingDesc: 'Yuk tashish holatini har bir bosqichda kuzating: Qabul qilindi, Yo\'lda, Yetkazib berildi.',
    readyToStart: 'Boshlashga tayyormisiz?',
    joinToday: 'Bugun bizga qo\'shiling va logistika operatsiyalaringizni soddalashtiring',
    createAccount: 'Hisob yaratish',
    
    // SaaS Landing Page Additions
    saasPricingTitle: 'Shaffof va qulay narxlar',
    saasPricingSubtitle: 'Sizning biznesingiz ehtiyojlari uchun moslashuvchan rejalar.',
    faqTitle: 'Ko\'p so\'raladigan savollar',
    faqSubtitle: 'Logistics Pro haqida eng ko\'p beriladigan savollar va ularga javoblar.',
    socialProofTitle: 'Dunyo bo\'ylab 500+ kompaniya bizga ishonadi',
    freePlan: 'Bepul',
    proPlan: 'Professional',
    
    // Common
    loadingProfile: 'Profil yuklanmoqda...',
    error: 'Xatolik',
    refresh: 'Yangilash'
  },
  en: {
    // Navbar
    home: 'Home',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Home Page
    heroTitle: 'Logistics Pro',
    heroSubtitle: 'Professional Transport & Logistics Management System',
    heroDescription: 'Simplify your logistics operations with our comprehensive freight tracking and management platform. Manage shipments, track vehicles, and monitor deliveries all in one place.',
    getStarted: 'Get Started',
    keyFeatures: 'Key Features',
    shipmentManagement: 'Shipment Management',
    shipmentManagementDesc: 'Track and manage all your shipments from creation to delivery with real-time status updates.',
    vehicleTracking: 'Vehicle Tracking',
    vehicleTrackingDesc: 'Monitor your fleet vehicles and assign them to shipments for efficient logistics operations.',
    dashboardAnalytics: 'Dashboard Analytics',
    dashboardAnalyticsDesc: 'Get comprehensive insights into your logistics operations with statistics and analytics.',
    statusTracking: 'Status Tracking',
    statusTrackingDesc: 'Track shipment status at every stage: Received, In Transit, Delivered.',
    readyToStart: 'Ready to get started?',
    joinToday: 'Join us today and simplify your logistics operations',
    createAccount: 'Create Account',
    
    // SaaS Landing Page Additions
    saasPricingTitle: 'Transparent and Affordable Pricing',
    saasPricingSubtitle: 'Flexible plans tailored to your business needs.',
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Common questions and answers about Logistics Pro.',
    socialProofTitle: '500+ companies worldwide trust us',
    freePlan: 'Free',
    proPlan: 'Professional',
    
    // Common
    loadingProfile: 'Loading profile...',
    error: 'Error',
    refresh: 'Refresh'
  }
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || translations.en[key] || key;
};
