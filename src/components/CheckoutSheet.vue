<template>
  <transition name="fade">
    <div v-if="open" class="fixed inset-0 z-40" @keydown.esc="close" :dir="dir">
      <!-- الخلفية -->
      <div class="absolute inset-0 bg-black/35" @click="close"></div>

      <!-- الشيت السفلي -->
      <div
        class="absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl p-4 sm:p-6 shadow-2xl z-10"
      >
        <div class="mx-auto w-full max-w-xl space-y-4">
          <!-- العنوان -->
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-extrabold">{{ labels?.title || 'إتمام الطلب' }}</h3>
            <button class="text-gray-500 hover:text-gray-700" @click="close" aria-label="Close">
              ✕
            </button>
          </div>

          <!-- ملخص الطلب -->
          <section>
            <div class="mb-2 text-sm font-bold text-gray-800">
              {{ labels?.orderSummary || 'ملخص الطلب' }}
            </div>

            <div class="max-h-48 overflow-auto rounded-xl border divide-y">
              <div
                v-for="it in cart"
                :key="it.key"
                class="flex items-center justify-between px-3 py-2 text-sm"
              >
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ it.name }}</div>
                  <div class="text-gray-500">
                    {{ labels?.qty || 'الكمية' }}: {{ it.qty }}
                    ·
                    {{ labels?.unitPrice || 'سعر الوحدة' }}: {{ fmt(it.unitPrice) }} {{ currency }}
                  </div>
                </div>
                <div class="font-bold">{{ fmt(it.unitPrice * it.qty) }} {{ currency }}</div>
              </div>
            </div>

            <!-- المجاميع -->
            <div class="mt-3 space-y-1 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">{{ labels?.subtotal || 'الإجمالي الفرعي' }}</span>
                <span class="font-semibold">{{ fmt(subtotal) }} {{ currency }}</span>
              </div>
              <div v-if="vatRate" class="flex items-center justify-between">
                <span class="text-gray-600">
                  {{ labels?.tax || 'الضريبة' }} ({{ (vatRate * 100).toFixed(0) }}%)
                </span>
                <span class="font-semibold">{{ fmt(tax) }} {{ currency }}</span>
              </div>
              <div class="flex items-center justify-between text-base font-extrabold">
                <span>{{ labels?.grandTotal || 'الإجمالي' }}</span>
                <span>{{ fmt(total) }} {{ currency }}</span>
              </div>
            </div>
          </section>

          <!-- بيانات العميل -->
          <section class="grid gap-3">
            <label class="block">
              <span class="text-sm text-gray-700">{{ labels?.name || 'الاسم' }}</span>
              <input
                v-model.trim="name"
                type="text"
                class="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                :placeholder="labels?.namePh || 'اكتب اسمك'"
              />
            </label>

            <label class="block">
              <span class="text-sm text-gray-700">{{ labels?.location || 'الموقع' }}</span>
              <input
                v-model.trim="location"
                type="text"
                class="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                :placeholder="labels?.locationPh || 'مثال: الشارقة - القاسمية - بناية ...'"
              />
            </label>

            <label class="block">
              <span class="text-sm text-gray-700">{{ labels?.note || 'ملاحظة' }}</span>
              <textarea
                v-model.trim="note"
                rows="2"
                class="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 resize-none"
                :placeholder="labels?.notePh || 'تعليمات خاصة للتوصيل (اختياري)'"
              ></textarea>
            </label>
          </section>

          <!-- أزرار -->
          <div class="mt-1 flex flex-col sm:flex-row gap-2">
            <button
              class="flex-1 rounded-full border px-4 py-2 font-semibold active:scale-95 transition"
              @click="close"
            >
              {{ labels?.cancel || 'إلغاء' }}
            </button>
            <button
              class="flex-1 rounded-full text-white font-bold px-4 py-2 active:scale-95 transition disabled:opacity-50"
              :style="btnStyle"
              :disabled="!canSubmit"
              @click="submit"
            >
              {{ labels?.confirm || 'إرسال عبر واتساب' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  initial: { type: Object, default: () => ({ name: '', location: '', note: '' }) },

  /* ملخص الطلب */
  cart: { type: Array, default: () => [] },
  currency: { type: String, default: '' },
  vatRate: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  /* واجهة */
  btnStyle: { type: Object, default: () => ({}) },
  labels: { type: Object, default: () => ({}) },
  dir: { type: String, default: 'rtl' },
  locale: { type: String, default: 'ar' },
})
const emit = defineEmits(['update:open', 'submit', 'cancel'])

const name = ref('')
const location = ref('')
const note = ref('')

watch(
  () => props.open,
  (v) => {
    if (v) {
      name.value = props.initial?.name || ''
      location.value = props.initial?.location || ''
      note.value = props.initial?.note || ''
    }
  },
)

onMounted(() => {
  if (props.open) {
    name.value = props.initial?.name || ''
    location.value = props.initial?.location || ''
    note.value = props.initial?.note || ''
  }
})

const canSubmit = computed(
  () => props.cart?.length > 0 && name.value.length > 1 && location.value.length > 3,
)

function fmt(n) {
  try {
    return new Intl.NumberFormat(props.locale === 'ar' ? 'ar' : 'en', {
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return n
  }
}

function close() {
  emit('update:open', false)
  emit('cancel')
}
function submit() {
  if (!canSubmit.value) return
  emit('submit', { name: name.value, location: location.value, note: note.value })
  emit('update:open', false)
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
</style>
