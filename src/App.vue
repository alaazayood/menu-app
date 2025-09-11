<template>
  <!-- سكيلتون تحميل -->
  <div
    v-if="status === 'loading'"
    class="min-h-screen bg-[linear-gradient(135deg,#fff7ed,35%,#fde68a)]"
    :dir="dir"
  >
    <header class="sticky top-0 z-20 glass border-b">
      <div class="container mx-auto px-4 py-3">
        <div class="h-8 w-40 skeleton rounded-full"></div>
      </div>
    </header>
    <main class="container mx-auto px-4 py-8">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="i in 8" :key="i" class="rounded-3xl overflow-hidden soft-shadow bg-white/90">
          <div class="h-52 skeleton"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 skeleton rounded"></div>
            <div class="h-3 skeleton rounded w-2/3"></div>
            <div class="h-9 skeleton rounded-full w-24 ml-auto"></div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- رسالة خطأ -->
  <div v-else-if="status === 'error'" class="p-8 text-center text-red-600" :dir="dir">
    {{ t('error') }}
    <pre class="mt-2 bg-white p-3 rounded-md shadow overflow-x-auto text-left text-xs">{{
      errorMsg
    }}</pre>
    <button @click="loadTenant" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-full">
      {{ t('retry') }}
    </button>
  </div>

  <!-- التطبيق -->
  <div
    v-else
    class="min-h-screen bg-[linear-gradient(135deg,#fff7ed,35%,#fde68a)]"
    :dir="dir"
    :class="[dir === 'rtl' ? 'text-right' : 'text-left']"
  >
    <!-- هيدر -->
    <header class="sticky top-0 z-20 glass border-b">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <button
          @click="toggleLanguage"
          class="px-3 py-1 rounded-full border text-sm"
          :style="{ borderColor: themePrimary }"
        >
          {{ currentLanguage === 'ar' ? 'EN' : 'AR' }}
        </button>
        <div class="flex items-center gap-3">
          <div
            v-if="tenant.brand?.logo"
            class="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-black/5 shadow"
          >
            <img
              :src="resolveAsset(tenant.brand.logo)"
              :alt="brandName"
              class="w-full h-full object-cover"
              @error="onImgError"
            />
          </div>
          <div class="text-center">
            <h1 class="text-2xl sm:text-3xl font-extrabold" :style="{ color: themePrimary }">
              {{ brandName }}
            </h1>
            <p class="text-xs sm:text-sm text-gray-500">
              {{ tenant.brand?.tagline || t('tagline') }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- شريط البحث -->
    <div v-if="products.length > 5" class="sticky top-[68px] sm:top-[72px] z-10 glass border-b">
      <div class="container mx-auto px-4 py-2">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('searchPlaceholder')"
            class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2"
            :style="{
              'padding-left': dir === 'rtl' ? '3rem' : '1rem',
              'padding-right': dir === 'rtl' ? '1rem' : '3rem',
            }"
          />
          <svg
            class="absolute top-2.5 text-gray-400"
            :class="dir === 'rtl' ? 'right-3' : 'left-3'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
    </div>

    <!-- تبويبات -->
    <nav v-if="tabs.length" class="sticky top-[108px] sm:top-[112px] z-10 glass border-b">
      <div class="container mx-auto px-4 py-2">
        <ul class="flex gap-2 overflow-x-auto no-scrollbar">
          <li v-for="c in tabs" :key="c.id">
            <button
              @click="activeCat = c.id"
              class="px-4 py-2 rounded-full text-sm font-bold transition-all"
              :style="tabStyle(c.id)"
            >
              {{ currentLanguage === 'ar' ? c.name_ar : c.name_en || c.name_ar }}
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- المنتجات (نسخة محسّنة للموبايل) -->
    <main
      class="container mx-auto px-4 py-8"
      :style="{ paddingBottom: cart.length ? 'calc(96px + var(--safe-bottom))' : '0px' }"
    >
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="(p, idx) in filteredProducts"
          :key="p.id"
          class="group card-base"
          :style="{ '--stagger': (idx % 12) * 60 + 'ms' }"
        >
          <div class="relative h-48 sm:h-52 overflow-hidden">
            <img
              :src="resolveImg(p)"
              :alt="currentLanguage === 'ar' ? p.name_ar : p.name_en || p.name_ar"
              class="w-full h-full object-cover card-img"
              @error="onImgError"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div class="price-badge" :style="{ color: themePrimary }">
              {{ formatPrice(p.price) }} {{ currency }}
            </div>
            <button class="add-fab" :style="btnStyle" @click="onAddClick(p)">
              {{ t('add') }}
              <span v-if="fabPing" class="ping"></span>
            </button>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-800 mb-1">
              {{ currentLanguage === 'ar' ? p.name_ar : p.name_en || p.name_ar }}
            </h3>
            <p v-if="p.description_ar || p.description_en" class="text-sm text-gray-600 mb-3">
              {{
                currentLanguage === 'ar' ? p.description_ar : p.description_en || p.description_ar
              }}
            </p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-transparent">#{{ p.id }}</span>
              <div class="flex items-center gap-2">
                <button
                  class="px-3 py-2 rounded-full border text-sm font-semibold hover:bg-gray-50 active:scale-95 transition"
                  @click="decFromGrid(p)"
                >
                  −
                </button>
                <button
                  class="px-4 py-2 rounded-full text-white font-bold soft-shadow active:scale-95 transition"
                  :style="btnStyle"
                  @click="onAddClick(p)"
                >
                  {{ t('add') }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
      <p v-if="!filteredProducts.length" class="text-center text-gray-500 py-16">
        {{ t('noProducts') }}
      </p>
    </main>

    <!-- شريط السلة + زر Checkout -->
    <div
      v-if="cart.length"
      :class="['fixed bottom-0 left-0 right-0 glass border-t cartbar', { bump: cartBump }]"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center gap-3 overflow-x-auto pb-2">
          <div
            v-for="it in cart"
            :key="it.key"
            class="glass border rounded-2xl px-3 py-2 flex items-center gap-2 soft-shadow line"
          >
            <span class="font-semibold text-sm max-w-[160px] truncate">{{ it.name }}</span>
            <div class="flex items-center gap-1">
              <button
                class="px-2 py-1 rounded-full border active:scale-95 transition"
                @click="decQty(it)"
              >
                −
              </button>
              <span class="w-6 text-center qty" :key="it.qty">{{ it.qty }}</span>
              <button
                class="px-2 py-1 rounded-full border active:scale-95 transition"
                @click="incQty(it)"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="text-sm">
            {{ t('items') }}: {{ itemCount }} · {{ t('total') }}:
            <span class="font-bold">{{ formatPrice(total) }} {{ currency }}</span>
            <span v-if="vatRate"> ({{ t('includesVat') }} {{ (vatRate * 100).toFixed(0) }}%)</span>
          </div>
          <button
            class="inline-block text-white font-bold px-5 py-2 rounded-full soft-shadow text-center active:scale-95 transition"
            :style="btnStyle"
            @click="openCheckout"
          >
            {{ t('sendWhatsApp') }}
          </button>
        </div>
      </div>
    </div>

    <!-- نافذة Checkout -->
    <transition name="fade">
      <div
        v-if="showCheckout"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        <div class="absolute inset-0 bg-black/40" @click="showCheckout = false"></div>
        <div
          class="relative w-full sm:w-[520px] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl p-5 sm:p-6"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xl font-extrabold">{{ t('newOrder') }}</h3>
            <button class="px-3 py-1 rounded-full border text-sm" @click="showCheckout = false">
              ✕
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-sm mb-1">{{ t('name') }}</label>
              <input
                v-model="customer.name"
                type="text"
                class="w-full px-4 py-2 rounded-xl border"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">{{ t('location') }}</label>
              <input
                v-model="customer.location"
                type="text"
                class="w-full px-4 py-2 rounded-xl border"
              />
            </div>
            <div>
              <label class="block text-sm mb-1">{{ t('note') }}</label>
              <textarea
                v-model="customer.note"
                rows="2"
                class="w-full px-4 py-2 rounded-xl border resize-none"
              ></textarea>
            </div>

            <div
              class="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-2xl border"
            >
              <span>{{ t('total') }}</span>
              <b>{{ formatPrice(total) }} {{ currency }}</b>
            </div>

            <button
              class="w-full text-white font-bold px-5 py-3 rounded-2xl soft-shadow active:scale-95 transition"
              :style="btnStyle"
              :disabled="sending"
              @click="confirmAndSend"
            >
              <span v-if="sending">{{ t('loading') }}</span>
              <span v-else>{{ t('sendWhatsApp') }}</span>
            </button>
            <p v-if="sendError" class="text-xs text-red-600">{{ sendError }}</p>
          </div>
        </div>
      </div>
    </transition>

    <!-- شاشة انتظار التأكيد -->
    <OrderWaitScreen
      :show="wait.show"
      :order-id="wait.id"
      :eta="wait.eta"
      :business-hours="wait.hours"
      :wa-link="lastWaLink"
      :phone-display="tenant?.contact?.phone_display || ''"
      :table="tableParam || ''"
      :btn-style="btnStyle"
      :lang="currentLanguage"
      @close="wait.show = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import OrderWaitScreen from './components/OrderWaitScreen.vue'

/* ===== ترجمة بسيطة ===== */
const translations = {
  ar: {
    appTitle: 'قائمة طعام إلكترونية',
    tagline: 'اطلب عبر واتساب',
    allCategories: 'الكل',
    add: 'أضف',
    items: 'العناصر',
    total: 'المجموع',
    includesVat: 'يشمل ضريبة',
    sendWhatsApp: 'إرسال واتساب',
    noProducts: 'لا توجد منتجات في هذا التصنيف',
    loading: 'جاري التحميل...',
    error: 'تعذّر تحميل القائمة',
    retry: 'إعادة المحاولة',
    name: 'الاسم',
    location: 'الموقع',
    note: 'ملاحظة',
    subtotal: 'الإجمالي الفرعي',
    tax: 'الضريبة',
    grandTotal: 'الإجمالي',
    newOrder: 'طلب جديد',
    searchPlaceholder: 'ابحث عن منتج...',
  },
  en: {
    appTitle: 'Digital Menu',
    tagline: 'Order via WhatsApp',
    allCategories: 'All',
    add: 'Add',
    items: 'Items',
    total: 'Total',
    includesVat: 'Includes VAT',
    sendWhatsApp: 'Send WhatsApp',
    noProducts: 'No products in this category',
    loading: 'Loading...',
    error: 'Failed to load menu',
    retry: 'Retry',
    name: 'Name',
    location: 'Location',
    note: 'Note',
    subtotal: 'Subtotal',
    tax: 'Tax',
    grandTotal: 'Total',
    newOrder: 'New Order',
    searchPlaceholder: 'Search for a product...',
  },
}
const currentLanguage = ref('ar')
const dir = computed(() => (currentLanguage.value === 'ar' ? 'rtl' : 'ltr'))
const t = (k) => translations[currentLanguage.value][k] || k
function toggleLanguage() {
  currentLanguage.value = currentLanguage.value === 'ar' ? 'en' : 'ar'
}

/* ===== قراءة tenant & table من الـ URL ===== */
const url = new URL(window.location.href)
const tenantIdFromUrl = url.searchParams.get('tenant') || 'default'
const tableParam = url.searchParams.get('table') || ''

/* ===== تحميل بيانات المطعم ===== */
const status = ref('loading')
const tenant = ref(null)
const errorMsg = ref('')
const searchQuery = ref('')

async function fetchWithTimeout(u, ms = 6000) {
  const ctrl = new AbortController()
  const tmo = setTimeout(() => ctrl.abort('timeout'), ms)
  try {
    return await fetch(u, { cache: 'no-store', signal: ctrl.signal })
  } finally {
    clearTimeout(tmo)
  }
}
async function loadTenant() {
  status.value = 'loading'
  errorMsg.value = ''
  const tries = [
    `/tenants/${tenantIdFromUrl}.json`,
    '/tenants/default.json',
    './tenants/default.json',
  ]
  for (const u of tries) {
    try {
      const r = await fetchWithTimeout(u, 7000)
      const raw = await r.text()
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${raw.slice(0, 200)}`)
      tenant.value = JSON.parse(raw)
      status.value = 'ok'
      await nextTick()
      return
    } catch (e) {
      errorMsg.value = `${u} → ${e?.message || e}`
    }
  }
  status.value = 'error'
}
onMounted(loadTenant)

/* ===== ثيم/معلومات عامة ===== */
const brandName = computed(() => {
  const b = tenant.value?.brand
  return currentLanguage.value === 'ar' ? b?.name_ar : b?.name_en || b?.name_ar || 'Restaurant'
})
const currency = computed(() => tenant.value?.business?.currency || 'AED')
const vatRate = computed(() => Number(tenant.value?.business?.tax_rate || 0))
const themePrimary = computed(() => tenant.value?.theme?.primary || '#f97316')
const themeSecondary = computed(() => tenant.value?.theme?.secondary || '#fb923c')
const btnStyle = computed(() => ({
  background: `linear-gradient(90deg,${themePrimary.value},${themeSecondary.value})`,
}))

/* ===== تبويبات/فلترة ===== */
const cats = computed(() => {
  const arr = tenant.value?.menu?.categories ? [...tenant.value.menu.categories] : []
  arr.sort((a, b) => (a.order || 0) - (b.order || 0))
  return arr
})
const tabs = computed(() => [
  { id: 'all', name_ar: t('allCategories'), name_en: t('allCategories') },
  ...cats.value,
])
const activeCat = ref('all')
const products = computed(() =>
  (tenant.value?.menu?.products || []).filter((p) => p.available !== false),
)
const filteredProducts = computed(() => {
  let f =
    activeCat.value === 'all'
      ? products.value
      : products.value.filter((p) => p.category_id === activeCat.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    f = f.filter(
      (p) =>
        p.name_ar?.toLowerCase().includes(q) ||
        p.name_en?.toLowerCase().includes(q) ||
        p.description_ar?.toLowerCase().includes(q) ||
        p.description_en?.toLowerCase().includes(q),
    )
  }
  return f
})

/* ===== السلة ===== */
const cart = reactive([]) // { key, sku, name, unitPrice, qty }
const cartBump = ref(false)
const toast = reactive({ show: false, text: '' })
const fabPing = ref(false)

function showToast(s) {
  toast.text = s
  toast.show = true
  setTimeout(() => (toast.show = false), 1200)
}
function bump() {
  cartBump.value = false
  requestAnimationFrame(() => {
    cartBump.value = true
    setTimeout(() => (cartBump.value = false), 400)
  })
}

function onAddClick(p) {
  addToCart(p)
  showToast(t('add') + ' ' + (currentLanguage.value === 'ar' ? p.name_ar : p.name_en || p.name_ar))
  fabPing.value = true
  setTimeout(() => (fabPing.value = false), 500)
}
function addToCart(p) {
  const key = p.id + '::{}'
  const name = currentLanguage.value === 'ar' ? p.name_ar : p.name_en || p.name_ar
  const found = cart.find((it) => it.key === key)
  if (found) found.qty++
  else cart.push({ key, sku: p.id, name, unitPrice: Number(p.price) || 0, qty: 1 })
  bump()
}
function decFromGrid(p) {
  const key = p.id + '::{}'
  const f = cart.find((it) => it.key === key)
  if (!f) return
  f.qty > 1 ? f.qty-- : removeLine(f)
  bump()
}
function incQty(it) {
  it.qty++
  bump()
}
function decQty(it) {
  it.qty > 1 ? (it.qty--, bump()) : (removeLine(it), bump())
}
function removeLine(it) {
  const i = cart.findIndex((x) => x.key === it.key)
  if (i >= 0) cart.splice(i, 1)
}

const itemCount = computed(() => cart.reduce((a, c) => a + c.qty, 0))
const subtotal = computed(() => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0))
const tax = computed(() => +(subtotal.value * vatRate.value).toFixed(2))
const total = computed(() => subtotal.value + tax.value)

/* ===== تفاصيل العميل (Checkout) ===== */
const showCheckout = ref(false)
const sending = ref(false)
const sendError = ref('')
const customer = reactive({
  name: localStorage.getItem('cust_name') || '',
  location: localStorage.getItem('cust_loc') || '',
  note: localStorage.getItem('cust_note') || '',
})
function openCheckout() {
  showCheckout.value = true
}
watch(
  () => customer.name,
  (v) => localStorage.setItem('cust_name', v || ''),
)
watch(
  () => customer.location,
  (v) => localStorage.setItem('cust_loc', v || ''),
)
watch(
  () => customer.note,
  (v) => localStorage.setItem('cust_note', v || ''),
)

/* ===== توليد Order ID + منع تكرار الإرسال + شاشة انتظار ===== */
const wait = reactive({ show: false, id: '', eta: '', hours: '' })
const lastWaLink = ref('#')
function generateOrderId(prefix = 'ORD') {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hm = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0')
  const k = 'seq_' + y + m + day
  const seq = +(localStorage.getItem(k) || '0') + 1
  localStorage.setItem(k, String(seq))
  return `${prefix}-${y}${m}${day}-${hm}-${String(seq).padStart(2, '0')}`
}
const cooldownMs = 3500
let lastSentAt = 0

function buildWaLinkWithOrder(orderId) {
  if (!tenant.value || !cart.length) return '#'
  const cur = currency.value
  const brand = brandName.value
  const lines = []
  lines.push(`${brand} - ${t('newOrder')}`)
  lines.push(`Order: ${orderId}`)
  if (tableParam) lines.push(`Table: ${tableParam}`)
  lines.push('')

  for (const it of cart)
    lines.push(`- ${it.name} ×${it.qty} = ${formatPrice(it.unitPrice * it.qty)} ${cur}`)

  if (vatRate.value) {
    lines.push('', `${t('subtotal')}: ${formatPrice(subtotal.value)} ${cur}`)
    lines.push(`${t('tax')}: ${formatPrice(tax.value)} ${cur}`)
  }
  lines.push(`${t('grandTotal')}: ${formatPrice(total.value)} ${cur}`, '')

  lines.push(`${t('name')}: ${customer.name || '—'}`)
  lines.push(`${t('location')}: ${customer.location || '—'}`)
  lines.push(`${t('note')}: ${customer.note || '—'}`)

  const text = encodeURIComponent(lines.join('\n'))
  const phone = (tenant.value?.contact?.whatsapp_e164 || '').replace('+', '')
  return phone ? `https://wa.me/${phone}?text=${text}` : '#'
}

async function confirmAndSend() {
  sendError.value = ''
  if (!cart.length) {
    sendError.value = 'السلة فارغة.'
    return
  }
  const now = Date.now()
  if (now - lastSentAt < cooldownMs) {
    sendError.value = 'حاول بعد ثوانٍ قليلة.'
    return
  }

  // رقم الطلب
  const prefix = tenant.value?.order_policy?.tenant_prefix || 'ORD'
  const orderId = generateOrderId(prefix)
  localStorage.setItem('last_order_id', orderId)

  // رابط واتساب
  const link = buildWaLinkWithOrder(orderId)
  lastWaLink.value = link

  // فتح واتساب
  sending.value = true
  try {
    window.open(link, '_blank')
  } finally {
    sending.value = false
    lastSentAt = now
    showCheckout.value = false

    // إعداد شاشة الانتظار
    wait.id = orderId
    wait.eta = tenant.value?.order_policy?.eta_minutes || ''
    wait.hours = tenant.value?.order_policy?.business_hours || ''
    if (tenant.value?.order_policy?.needs_confirmation !== false) {
      wait.show = true
    }
  }
}

/* ===== صور/أصول (آمنة وبسيطة) ===== */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24">No Image</text></svg>'

function resolveImg(p) {
  if (p?.image_url) return p.image_url
  if (p?.image) return 'images/' + p.image
  return PLACEHOLDER
}

function resolveAsset(s) {
  if (!s) return ''
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('data:')) return s
  if (s.startsWith('/')) return s
  return '/' + s.replace(/^\.?\//, '')
}

function onImgError(e) {
  e.target.src = PLACEHOLDER
  e.target.onerror = null
}

/* ===== أدوات عرض ===== */
function tabStyle(id) {
  const active = activeCat.value === id
  return active
    ? {
        background: `linear-gradient(90deg,${themePrimary.value},${themeSecondary.value})`,
        color: '#fff',
      }
    : { border: '1px solid #e5e7eb', color: '#111827', background: '#fff' }
}
function formatPrice(n) {
  try {
    return new Intl.NumberFormat(currentLanguage.value === 'ar' ? 'ar' : 'en', {
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return n
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
}
.soft-shadow {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

/* Skeleton */
.skeleton {
  position: relative;
  background: linear-gradient(90deg, #f3f4f6 20%, #e5e7eb 35%, #f3f4f6 60%);
  background-size: 300% 100%;
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* بطاقة: مرئية دائمًا + دخول لطيف */
.card-base {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  animation: fadeUp 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: var(--stagger, 0ms);
}
@keyframes fadeUp {
  0% {
    transform: translateY(14px) scale(0.98);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
.card-img {
  transition: transform 0.6s ease;
}
.group:hover .card-img {
  transform: scale(1.06);
}

/* بادج السعر */
.price-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  animation: pop 0.5s ease;
}
@keyframes pop {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* زر الإضافة */
.add-fab {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  color: #fff;
  font-weight: 800;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.25s,
    transform 0.25s;
}
.group:hover .add-fab {
  opacity: 1;
  transform: translateY(0);
}

/* لمس الموبايل: أظهر زر الإضافة دائمًا وألغ تكبير الصورة */
@media (hover: none) and (pointer: coarse) {
  .add-fab {
    opacity: 1;
    transform: translateY(0);
  }
  .card-base:hover .card-img {
    transform: none;
  }
}

/* safe area للأسفل عند ظهور السلة */
:root {
  --safe-bottom: env(safe-area-inset-bottom, 0);
}
.cartbar {
  padding-bottom: max(0px, var(--safe-bottom));
}

/* cart bump */
.cartbar {
  transform: translateZ(0);
}
.cartbar.bump {
  animation: bump 0.35s ease;
}
@keyframes bump {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
.line .qty {
  display: inline-block;
  animation: qtypop 0.25s ease;
}
@keyframes qtypop {
  from {
    transform: scale(0.8);
    opacity: 0.6;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* مناطق لمس مريحة */
button {
  min-height: 44px;
  min-width: 44px;
}

/* fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* no scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* تقليل الحركة عند تفضيل المستخدم */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
