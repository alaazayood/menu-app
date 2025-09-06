// النظام المتقدم للإعدادات - قلب التطبيق
export const appSettings = {
  // المعلومات الأساسية
  restaurant: {
    name: 'المطعم العراقي',
    slogan: 'أطيب الأكلات العراقية الأصيلة',
    description: 'مطعم يقدم أشهى المأكولات العراقية بلمسة عصرية',
    logo: '/images/logo.png',
    coverImage: '/images/cover.jpg',
    established: 2024,
  },

  // المظهر والتخصيص
  theme: {
    primaryColor: '#d97706',
    secondaryColor: '#92400e',
    accentColor: '#f59e0b',
    backgroundColor: '#fffbeb',
    textColor: '#1f2937',
    fontFamily: 'Cairo, sans-serif',
    direction: 'rtl',
    rounded: 'lg', // sm, md, lg, xl
  },

  // معلومات التواصل
  contact: {
    phone: '+971501234567',
    whatsapp: '+971501234567',
    location: 'الشارقة، الإمارات العربية المتحدة',
    coordinates: { lat: 25.3463, lng: 55.4209 },
    email: 'info@iraqirestaurant.ae',
    social: {
      instagram: '@iraqi_restaurant',
      facebook: 'IraqiRestaurant',
      tiktok: '@iraqi_restaurant',
    },
  },

  // إعدادات التشغيل
  hours: {
    sunday: { open: '10:00', close: '23:00' },
    monday: { open: '10:00', close: '23:00' },
    tuesday: { open: '10:00', close: '23:00' },
    wednesday: { open: '10:00', close: '23:00' },
    thursday: { open: '10:00', close: '00:00' },
    friday: { open: '12:00', close: '00:00' },
    saturday: { open: '10:00', close: '23:00' },
  },

  // إعدادات الطلبات
  orders: {
    whatsappEnabled: true,
    minimumOrder: 25,
    deliveryFee: 10,
    freeDeliveryThreshold: 100,
    preparationTime: '20-30 دقيقة',
    paymentMethods: ['نقدي', 'بطاقة ائتمان', 'تحويل بنكي'],
    deliveryZones: [
      { name: 'الشارقة', fee: 10 },
      { name: 'دبي', fee: 25 },
      { name: 'عجمان', fee: 15 },
    ],
  },

  // الإعدادات الفنية
  app: {
    currency: 'درهم إماراتي',
    currencySymbol: 'د.إ',
    language: 'ar',
    timezone: 'Asia/Dubai',
    version: '1.0.0',
  },
}

// نظام التخصيص الديناميكي
export class SettingsManager {
  static updateSettings(newSettings) {
    Object.assign(appSettings, newSettings)
    this.saveToStorage()
    this.applyTheme()
  }

  static saveToStorage() {
    localStorage.setItem('restaurant_settings', JSON.stringify(appSettings))
  }

  static loadFromStorage() {
    const saved = localStorage.getItem('restaurant_settings')
    if (saved) {
      Object.assign(appSettings, JSON.parse(saved))
    }
    this.applyTheme()
    return appSettings
  }

  static applyTheme() {
    // تطبيق الألوان ديناميكياً على الـ CSS
    const root = document.documentElement
    root.style.setProperty('--primary-color', appSettings.theme.primaryColor)
    root.style.setProperty('--secondary-color', appSettings.theme.secondaryColor)
    root.style.setProperty('--accent-color', appSettings.theme.accentColor)
    root.style.setProperty('--bg-color', appSettings.theme.backgroundColor)
    root.style.setProperty('--text-color', appSettings.theme.textColor)
  }

  // توليد رسالة واتساب مخصصة
  static generateOrderMessage(order) {
    const { restaurant, orders } = appSettings
    let message = `*${restaurant.name}*%0A`
    message += `*طلب جديد*%0A%0A`
    message += `*العميل:* ${order.customerName}%0A`
    message += `*الهاتف:* ${order.customerPhone}%0A`
    message += `*العنوان:* ${order.customerAddress}%0A%0A`

    message += `*الطلبات:*%0A`
    order.items.forEach((item) => {
      message += `- ${item.name} x ${item.quantity} - ${item.price * item.quantity} ${orders.currencySymbol}%0A`
    })

    message += `%0A*المجموع: ${order.total} ${orders.currencySymbol}*%0A`
    message += `*رسوم التوصيل: ${order.deliveryFee} ${orders.currencySymbol}*%0A`
    message += `*الإجمالي: ${order.grandTotal} ${orders.currencySymbol}*%0A%0A`

    message += `*طريقة الدفع:* ${order.paymentMethod}%0A`
    message += `*ملاحظات:* ${order.notes || 'لا يوجد'}%0A%0A`

    message += `شكراً لطلبكم من ${restaurant.name}! 🍽️`

    return encodeURIComponent(message)
  }
}

// التهيئة الأولية
SettingsManager.loadFromStorage()
