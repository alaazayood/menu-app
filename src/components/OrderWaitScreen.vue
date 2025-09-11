<template>
  <transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

      <div
        class="relative w-full sm:w-[520px] max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6 overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-xl font-extrabold">{{ t('waitingTitle') }}</h3>
          <button class="px-3 py-1 rounded-full border text-sm" @click="$emit('close')">✕</button>
        </div>

        <div class="space-y-3">
          <div class="p-3 rounded-2xl bg-gray-50 border flex items-center justify-between gap-3">
            <div>
              <div class="text-xs text-gray-500">{{ t('orderId') }}</div>
              <div class="font-mono font-bold text-lg">{{ orderId }}</div>
            </div>
            <button
              class="px-3 py-2 rounded-full border text-sm font-semibold hover:bg-gray-50 active:scale-95 transition"
              @click="copy(orderId)"
            >
              {{ t('copy') }}
            </button>
          </div>

          <div v-if="eta || businessHours" class="p-3 rounded-2xl bg-gray-50 border">
            <p v-if="eta" class="text-sm">
              {{ t('eta') }}: <b>{{ eta }}</b> {{ t('minutes') }}
            </p>
            <p v-if="businessHours" class="text-sm mt-1">
              {{ t('hours') }}: <b>{{ businessHours }}</b>
            </p>
          </div>

          <div v-if="table" class="p-3 rounded-2xl bg-gray-50 border">
            <p class="text-sm">
              {{ t('table') }}: <b>{{ table }}</b>
            </p>
          </div>

          <div class="grid sm:grid-cols-3 gap-2 mt-2">
            <a
              v-if="waLink && waLink !== '#'"
              :href="waLink"
              target="_blank"
              class="text-center px-4 py-2 rounded-full text-white font-bold soft-shadow"
              :style="btnStyle"
            >
              {{ t('openWhatsApp') }}
            </a>
            <a
              v-if="phoneDisplay"
              :href="telHref"
              class="text-center px-4 py-2 rounded-full border font-semibold hover:bg-gray-50"
            >
              {{ t('call') }}
            </a>
            <button
              class="px-4 py-2 rounded-full border font-semibold hover:bg-gray-50"
              @click="$emit('close')"
            >
              {{ t('gotIt') }}
            </button>
          </div>

          <p class="text-xs text-gray-500 mt-2">
            {{ t('tip') }}
          </p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  show: { type: Boolean, default: false },
  orderId: { type: String, default: '' },
  eta: { type: [Number, String], default: '' },
  businessHours: { type: String, default: '' },
  waLink: { type: String, default: '#' },
  phoneDisplay: { type: String, default: '' },
  table: { type: String, default: '' },
  btnStyle: {
    type: Object,
    default: () => ({ background: 'linear-gradient(90deg,#f97316,#fb923c)' }),
  },
  lang: { type: String, default: 'ar' },
})

const t = (key) => {
  const dict = {
    ar: {
      waitingTitle: 'بانتظار تأكيد المطعم',
      orderId: 'رقم الطلب',
      copy: 'نسخ',
      eta: 'الوقت التقريبي',
      minutes: 'دقيقة',
      hours: 'ساعات العمل',
      openWhatsApp: 'فتح واتساب مجددًا',
      call: 'اتصال',
      gotIt: 'تم الاستلام',
      tip: 'احتفظ برقم الطلب للاستفسار. يمكنك فتح واتساب مرة أخرى أو الاتصال بالمطعم عند الحاجة.',
      table: 'رقم الطاولة',
    },
    en: {
      waitingTitle: 'Waiting for confirmation',
      orderId: 'Order ID',
      copy: 'Copy',
      eta: 'Estimated time',
      minutes: 'min',
      hours: 'Business hours',
      openWhatsApp: 'Open WhatsApp again',
      call: 'Call',
      gotIt: 'Got it',
      tip: 'Keep your order ID for reference. You can reopen WhatsApp or call the restaurant.',
      table: 'Table',
    },
  }
  const lang = props.lang === 'ar' ? 'ar' : 'en'
  return dict[lang][key] || key
}

const telHref = computed(() => {
  if (!props.phoneDisplay) return '#'
  const digits = props.phoneDisplay.replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : '#'
})

function copy(text) {
  navigator.clipboard?.writeText(text)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.soft-shadow {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
</style>
