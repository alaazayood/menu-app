<template>
  <header class="sticky top-0 z-20 glass border-b">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between" :dir="dir">
      <!-- زر اللغة -->
      <button
        @click="$emit('toggle-language')"
        class="px-3 py-1 rounded-full border text-sm font-semibold active:scale-95 transition"
        :style="{ borderColor: themePrimary, color: themePrimary }"
        aria-label="Toggle language"
      >
        {{ currentLanguage === 'ar' ? 'EN' : 'AR' }}
      </button>

      <!-- الشعار + العنوان -->
      <div class="flex items-center gap-3">
        <div
          v-if="logoSrc"
          class="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow shrink-0"
        >
          <img
            :src="logoSrc"
            :alt="brandName || 'Logo'"
            class="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            @error="onLogoError"
          />
        </div>

        <div class="text-center">
          <h1
            class="text-2xl sm:text-3xl font-extrabold leading-tight"
            :style="{ color: themePrimary }"
          >
            {{ brandName }}
          </h1>
          <p v-if="tagline" class="text-xs sm:text-sm text-gray-500">
            {{ tagline }}
          </p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  brandName: { type: String, default: '' },
  brandLogo: { type: String, default: '' }, // يمكن أن يكون /logos/… أو URL كامل
  tagline: { type: String, default: '' },
  themePrimary: { type: String, default: '#f97316' },
  currentLanguage: { type: String, default: 'ar' },
  dir: { type: String, default: 'rtl' },
})
defineEmits(['toggle-language'])

/* التعامل مع BASE_URL كي تعمل الروابط النسبية على GitHub Pages */
const BASE = import.meta.env.BASE_URL
const logoSrc = computed(() => {
  const p = props.brandLogo
  if (!p) return ''
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:')) return p
  if (p.startsWith('/')) return BASE + p.slice(1)
  return BASE + p.replace(/^\.?\//, '')
})

function onLogoError(e) {
  // أخفِ الصورة إن فشل التحميل
  e.target.style.display = 'none'
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
}
</style>
