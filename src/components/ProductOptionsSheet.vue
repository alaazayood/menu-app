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
          <h3 class="text-xl font-extrabold">{{ name }}</h3>
          <button class="px-3 py-1 rounded-full border text-sm" @click="$emit('close')">✕</button>
        </div>

        <!-- صورة + السعر -->
        <div v-if="img" class="px-5 pt-5">
          <div class="h-48 rounded-2xl overflow-hidden ring-1 ring-black/5">
            <img :src="img" :alt="name" class="w-full h-full object-cover" @error="onImgError" />
          </div>
        </div>

        <div class="px-5 pt-3" :dir="dir">
          <p class="text-gray-600" v-if="desc">{{ desc }}</p>
        </div>

        <!-- المجموع الحالي -->
        <div class="px-5 mt-3" :dir="dir">
          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border">
            <span class="text-sm">{{ t('total') }}</span>
            <b class="text-lg">{{ formatPrice(totalPrice) }} {{ currency }}</b>
          </div>
        </div>

        <!-- مجموعات الخيارات -->
        <div class="px-5 py-4 space-y-5" :dir="dir" v-if="groups && groups.length">
          <div v-for="g in groups" :key="g.id" class="space-y-2">
            <div class="flex items-center gap-2">
              <h4 class="font-bold">
                {{ lang === 'ar' ? g.label_ar || g.id : g.label_en || g.label_ar || g.id }}
              </h4>
              <span v-if="g.required" class="text-xs text-orange-600">• {{ t('required') }}</span>
            </div>

            <!-- نوع single -->
            <div v-if="g.type === 'single'" class="flex flex-wrap gap-2">
              <button
                v-for="opt in g.options"
                :key="opt.id"
                class="px-3 py-2 rounded-full border text-sm font-semibold transition active:scale-95"
                :class="isSingleSelected(g.id, opt.id) ? 'text-white' : ''"
                :style="isSingleSelected(g.id, opt.id) ? btnStyle : { borderColor: '#e5e7eb' }"
                @click="selectSingle(g.id, opt.id)"
              >
                {{ optLabel(opt) }}
                <span v-if="opt.priceDelta" class="opacity-80">
                  (+{{ formatPrice(opt.priceDelta) }})
                </span>
              </button>
            </div>

            <!-- نوع multi -->
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="opt in g.options"
                :key="opt.id"
                class="px-3 py-2 rounded-full border text-sm font-semibold transition active:scale-95"
                :class="isMultiSelected(g.id, opt.id) ? 'text-white' : ''"
                :style="isMultiSelected(g.id, opt.id) ? btnStyle : { borderColor: '#e5e7eb' }"
                @click="toggleMulti(g.id, opt.id)"
              >
                {{ optLabel(opt) }}
                <span v-if="opt.priceDelta" class="opacity-80">
                  (+{{ formatPrice(opt.priceDelta) }})
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- أزرار -->
        <div class="p-5 border-t" :dir="dir">
          <button
            class="w-full text-white font-bold px-5 py-3 rounded-2xl soft-shadow active:scale-95 transition"
            :style="btnStyle"
            :disabled="!canConfirm"
            @click="confirm"
          >
            {{ t('add') }} · {{ formatPrice(totalPrice) }} {{ currency }}
          </button>
          <p v-if="!canConfirm" class="mt-2 text-xs text-red-600">{{ t('completeRequired') }}</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  product: { type: Object, default: null },
  lang: { type: String, default: 'ar' },
  currency: { type: String, default: 'AED' },
  btnStyle: {
    type: Object,
    default: () => ({ background: 'linear-gradient(90deg,#f97316,#fb923c)' }),
  },
})
const emit = defineEmits(['close', 'confirm'])

const translations = {
  ar: {
    total: 'المجموع',
    add: 'أضف',
    required: 'إلزامي',
    completeRequired: 'أكمل الحقول الإلزامية أولًا',
  },
  en: {
    total: 'Total',
    add: 'Add',
    required: 'Required',
    completeRequired: 'Please complete required selections',
  },
}
const t = (k) => translations[props.lang][k] || k
const dir = computed(() => (props.lang === 'ar' ? 'rtl' : 'ltr'))

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24">No Image</text></svg>'

/* بيانات العرض */
const name = computed(() => {
  if (!props.product) return ''
  return props.lang === 'ar'
    ? props.product.name_ar || props.product.name_en || ''
    : props.product.name_en || props.product.name_ar || ''
})
const desc = computed(() => {
  if (!props.product) return ''
  return props.lang === 'ar'
    ? props.product.description_ar || props.product.description_en || ''
    : props.product.description_en || props.product.description_ar || ''
})
const img = computed(() => {
  if (!props.product) return ''
  if (props.product.image_url) return props.product.image_url
  if (props.product.image) return 'images/' + props.product.image
  return PLACEHOLDER
})
const groups = computed(() => props.product?.option_groups || [])
const basePrice = computed(() => Number(props.product?.price || 0))

/* اختيار المستخدم */
const selected = reactive({}) // {groupId: id | [ids]}
function optLabel(opt) {
  return props.lang === 'ar' ? opt.label_ar || opt.id : opt.label_en || opt.label_ar || opt.id
}
function isSingleSelected(gid, oid) {
  return selected[gid] === oid
}
function isMultiSelected(gid, oid) {
  return Array.isArray(selected[gid]) && selected[gid].includes(oid)
}
function selectSingle(gid, oid) {
  selected[gid] = oid
}
function toggleMulti(gid, oid) {
  if (!Array.isArray(selected[gid])) selected[gid] = []
  const arr = selected[gid]
  const i = arr.indexOf(oid)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(oid)
}
function resetSelections() {
  // قيّم افتراضية: لو required + single خليه أول خيار
  ;(groups.value || []).forEach((g) => {
    if (g.type === 'single') {
      selected[g.id] = g.required ? (g.options?.[0]?.id ?? null) : (selected[g.id] ?? null)
    } else {
      if (!Array.isArray(selected[g.id])) selected[g.id] = []
    }
  })
}
watch(() => props.product, resetSelections, { immediate: true })
watch(
  () => props.show,
  (v) => {
    if (v) resetSelections()
  },
)

/* التسعير */
function resolveOptionById(groupId, optId) {
  const g = (groups.value || []).find((x) => x.id === groupId)
  if (!g) return null
  return (g.options || []).find((o) => o.id === optId) || null
}
const deltaSum = computed(() => {
  let sum = 0
  for (const g of groups.value || []) {
    if (g.type === 'single') {
      const oid = selected[g.id]
      if (oid) {
        const opt = resolveOptionById(g.id, oid)
        if (opt && opt.priceDelta) sum += Number(opt.priceDelta) || 0
      }
    } else {
      const ids = Array.isArray(selected[g.id]) ? selected[g.id] : []
      ids.forEach((oid) => {
        const opt = resolveOptionById(g.id, oid)
        if (opt && opt.priceDelta) sum += Number(opt.priceDelta) || 0
      })
    }
  }
  return sum
})
const totalPrice = computed(() => basePrice.value + deltaSum.value)

/* تحقق الإلزاميات */
const canConfirm = computed(() => {
  for (const g of groups.value || []) {
    if (!g.required) continue
    if (g.type === 'single' && !selected[g.id]) return false
    if (g.type === 'multi' && (!Array.isArray(selected[g.id]) || selected[g.id].length === 0))
      return false
  }
  return true
})

/* مفتاح الخيارات + ملخص نصي */
function stableStringify(val) {
  if (Array.isArray(val)) return '[' + val.slice().sort().map(stableStringify).join(',') + ']'
  if (val && typeof val === 'object') {
    return (
      '{' +
      Object.keys(val)
        .sort()
        .map((k) => JSON.stringify(k) + ':' + stableStringify(val[k]))
        .join(',') +
      '}'
    )
  }
  return JSON.stringify(val)
}
function selectionSummary() {
  const parts = []
  for (const g of groups.value || []) {
    if (g.type === 'single') {
      const oid = selected[g.id]
      if (oid) {
        const opt = resolveOptionById(g.id, oid)
        if (opt) {
          const gl = props.lang === 'ar' ? g.label_ar || g.id : g.label_en || g.label_ar || g.id
          const ol = optLabel(opt)
          parts.push(`${gl}: ${ol}`)
        }
      }
    } else {
      const ids = Array.isArray(selected[g.id]) ? selected[g.id] : []
      if (ids.length) {
        const gl = props.lang === 'ar' ? g.label_ar || g.id : g.label_en || g.label_ar || g.id
        const labels = ids.map((id) => {
          const o = resolveOptionById(g.id, id)
          return o ? optLabel(o) : id
        })
        parts.push(`${gl}: ${labels.join(', ')}`)
      }
    }
  }
  return parts.join(' · ')
}
function confirm() {
  if (!canConfirm.value) return
  const key = props.product.id + '::' + stableStringify(selected)
  const summary = selectionSummary()
  const displayName = summary ? `${name.value} (${summary})` : name.value
  emit('confirm', {
    key,
    displayName,
    unitPrice: totalPrice.value,
  })
}

/* أدوات */
function formatPrice(n) {
  try {
    return new Intl.NumberFormat(props.lang === 'ar' ? 'ar' : 'en', {
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return n
  }
}
function onImgError(e) {
  e.target.src = PLACEHOLDER
  e.target.onerror = null
}
</script>

<style scoped>
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
