<template>
  <transition name="sheet-fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <!-- خلفية -->
      <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

      <!-- الورقة -->
      <div
        class="relative w-full sm:w-[560px] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] overflow-y-auto"
      >
        <!-- رأس -->
        <div class="p-5 border-b flex items-center justify-between" :dir="dir">
          <h3 class="text-xl font-extrabold">{{ t('yourCart') }}</h3>
          <button class="px-3 py-1 rounded-full border text-sm" @click="$emit('close')">✕</button>
        </div>

        <!-- عناصر السلة -->
        <div class="p-5 space-y-3" :dir="dir">
          <div
            v-for="it in items"
            :key="it.key"
            class="glass border rounded-2xl p-3 flex items-center justify-between gap-3"
          >
            <div class="min-w-0">
              <p class="font-semibold text-sm truncate max-w-[240px]">{{ it.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ formatPrice(it.unitPrice) }} {{ currency }} × {{ it.qty }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button
                class="px-3 py-2 rounded-full border active:scale-95 transition"
                @click="$emit('dec', it)"
              >
                −
              </button>
              <span class="w-6 text-center font-semibold">{{ it.qty }}</span>
              <button
                class="px-3 py-2 rounded-full border active:scale-95 transition"
                @click="$emit('inc', it)"
              >
                +
              </button>
              <button
                class="px-3 py-2 rounded-full border text-red-600 active:scale-95 transition"
                @click="$emit('remove', it)"
              >
                🗑
              </button>
            </div>
          </div>

          <p v-if="!items.length" class="text-center text-gray-500 py-8">{{ t('emptyCart') }}</p>
        </div>

        <!-- ملخص -->
        <div class="px-5 pb-5 space-y-3 border-t" :dir="dir">
          <div
            class="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-2xl border mt-4"
          >
            <span>{{ t('items') }}: {{ itemCount }}</span>
            <span>{{ t('subtotal') }}: {{ formatPrice(subtotal) }} {{ currency }}</span>
          </div>
          <div
            v-if="vatRate"
            class="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-2xl border"
          >
            <span>{{ t('tax') }} ({{ (vatRate * 100).toFixed(0) }}%)</span>
            <span>{{ formatPrice(tax) }} {{ currency }}</span>
          </div>
          <div
            class="flex items-center justify-between text-base bg-gray-100 p-3 rounded-2xl border"
          >
            <b>{{ t('total') }}</b>
            <b>{{ formatPrice(total) }} {{ currency }}</b>
          </div>

          <button
            class="w-full text-white font-bold px-5 py-3 rounded-2xl soft-shadow active:scale-95 transition"
            :style="btnStyle"
            :disabled="!items.length"
            @click="$emit('checkout')"
          >
            {{ t('proceed') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  currency: { type: String, default: 'AED' },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  lang: { type: String, default: 'ar' },
  btnStyle: {
    type: Object,
    default: () => ({ background: 'linear-gradient(90deg,#f97316,#fb923c)' }),
  },
})

defineEmits(['close', 'inc', 'dec', 'remove', 'checkout'])

const translations = {
  ar: {
    yourCart: 'سلة المشتريات',
    emptyCart: 'السلة فارغة',
    items: 'العناصر',
    subtotal: 'الإجمالي الفرعي',
    tax: 'الضريبة',
    total: 'المجموع',
    proceed: 'إتمام الطلب',
  },
  en: {
    yourCart: 'Your Cart',
    emptyCart: 'Cart is empty',
    items: 'Items',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'Total',
    proceed: 'Proceed to Checkout',
  },
}
const t = (k) => translations[props.lang][k] || k
const dir = computed(() => (props.lang === 'ar' ? 'rtl' : 'ltr'))
const itemCount = computed(() => props.items.reduce((a, c) => a + c.qty, 0))

function formatPrice(n) {
  try {
    return new Intl.NumberFormat(props.lang === 'ar' ? 'ar' : 'en', {
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return n
  }
}
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
}
.soft-shadow {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>
