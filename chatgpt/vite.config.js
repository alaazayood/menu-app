import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // اجعل الروابط نسبية ليعمل الموقع من أي مسار (حتى داخل مجلد فرعي)
  base: './',

  plugins: [
    vue(),
    // فعّل أدوات التطوير في وضع التطوير فقط
    ...(mode === 'development' ? [vueDevTools()] : []),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // عرض عنوان الشبكة في dev والـ preview للتجربة على الجوال
  server: { host: true },
  preview: { host: true },
}))
