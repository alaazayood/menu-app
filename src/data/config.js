// نموذج بيانات المطعم القابل للتخصيص
export const restaurantConfig = {
  name: 'المطعم العراقي',
  logo: '/logo.png',
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
  },
  contact: {
    phone: '+963966262458',
    location: 'الشارقة، الإمارات',
  },
  social: {
    instagram: '@iraqi_restaurant',
    whatsapp: '+971501234567',
  },
}

// نموذج بيانات القائمة
export const menuData = {
  categories: [
    {
      id: 1,
      name: 'المقبلات العراقية',
      items: [
        {
          id: 101,
          name: 'كباب حلة',
          description: 'كباب عراقي أصيل مع الأرز البسمتي',
          price: 35,
          image: '/images/kebab.jpg',
        },
      ],
    },
  ],
}
