<template>
  <!-- سكيلتون -->
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

  <!-- خطأ -->
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
    <AppHeader
      :brand-name="brandName"
      :brand-logo="resolveAsset(tenant.brand?.logo)"
      :tagline="tenant.brand?.tagline || t('tagline')"
      :theme-primary="themePrimary"
      :current-language="currentLanguage"
      :dir="dir"
      @toggle-language="toggleLanguage"
    />

    <!-- بحث -->
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
    <CategoryTabs
      v-model:activeId="activeCat"
      :tabs="tabs"
      :current-language="currentLanguage"
      :theme-primary="themePrimary"
      :theme-secondary="themeSecondary"
      :dir="dir"
    />

    <!-- المنتجات -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ProductCard
          v-for="(p, idx) in filteredProducts"
          :key="p.id"
          :image-url="resolveImg(p)"
          :title="currentLanguage === 'ar' ? p.name_ar : p.name_en || p.name_ar"
          :desc="currentLanguage === 'ar' ? p.description_ar : p.description_en || p.description_ar"
          :sku="p.id"
          :price="p.price"
          :currency="currency"
          :add-label="t('add')"
          :btn-style="btnStyle"
          :theme-primary="themePrimary"
          :in-view="inView[p.id]"
          :stagger-ms="(idx % 12) * 60"
          :dir="dir"
          @add="onAddClick(p)"
          @dec="decFromGrid(p)"
        />
      </div>
      <p v-if="!filteredProducts.length" class="text-center text-gray-500 py-16">
        {{ t('noProducts') }}
      </p>
    </main>

    <!-- السلة -->
    <CartBar
      :cart="cart"
      :item-count="itemCount"
      :subtotal="subtotal"
      :tax="tax"
      :total="total"
      :vat-rate="vatRate"
      :currency="currency"
      :total-formatted="formatPrice(total) + ' ' + currency"
      :labels="{
        items: t('items'),
        total: t('total'),
        includesVat: t('includesVat'),
        sendWhatsApp: t('sendWhatsApp'),
      }"
      :btn-style="btnStyle"
      :bump="cartBump"
      :dir="dir"
      @inc="incQty"
      @dec="decQty"
      @checkout="openCheckout"
    />

    <!-- نافذة التأكيد -->
    <CheckoutSheet
      v-model:open="checkoutOpen"
      :initial="customer"
      :cart="cart"
      :currency="currency"
      :vat-rate="vatRate"
      :subtotal="subtotal"
      :tax="tax"
      :total="total"
      :btn-style="btnStyle"
      :dir="dir"
      :locale="currentLanguage === 'ar' ? 'ar' : 'en'"
      :labels="checkoutLabels"
      @submit="handleCheckoutSubmit"
    />

    <!-- Toast -->
    <div
      v-if="toast.show"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold soft-shadow"
      :style="btnStyle"
    >
      {{ toast.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import ProductCard from '@/components/ProductCard.vue'
import CartBar from '@/components/CartBar.vue'
import CheckoutSheet from '@/components/CheckoutSheet.vue'

/* ===== ترجمة ===== */
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
    confirmSend: 'إرسال عبر واتساب',
    cancel: 'إلغاء',
    checkoutTitle: 'أكمل بيانات الطلب',
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
    confirmSend: 'Send via WhatsApp',
    cancel: 'Cancel',
    checkoutTitle: 'Complete order details',
  },
}
const currentLanguage = ref('ar')
const dir = computed(() => (currentLanguage.value === 'ar' ? 'rtl' : 'ltr'))
const t = (k) => translations[currentLanguage.value][k] || k
function toggleLanguage() {
  currentLanguage.value = currentLanguage.value === 'ar' ? 'en' : 'ar'
  try {
    localStorage.setItem('lang', currentLanguage.value)
  } catch {
    /* empty */
  }
}

/* ===== مسارات BASE-aware ===== */
const BASE = import.meta.env.BASE_URL
const withBase = (p) => {
  if (!p) return ''
  if (/^(https?:)?\/\//i.test(p) || p.startsWith('data:')) return p
  if (p.startsWith('/')) return BASE + p.slice(1)
  return BASE + p.replace(/^\.?\//, '')
}
function resolveAsset(p) {
  return withBase(p)
}
const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24">No Image</text></svg>'
function resolveImg(p) {
  return p?.image_url ? withBase(p.image_url) : PLACEHOLDER
}

/* ===== تحميل بيانات المطعم (Multi-Tenant) ===== */
const status = ref('loading')
const tenant = ref(null)
const errorMsg = ref('')
const searchQuery = ref('')

async function fetchWithTimeout(url, ms = 6000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort('timeout'), ms)
  try {
    return await fetch(url, { cache: 'no-store', signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}
async function loadTenant() {
  status.value = 'loading'
  errorMsg.value = ''

  const params = new URLSearchParams(location.search)
  const key = (params.get('tenant') || 'default').trim().toLowerCase()
  const base = BASE.endsWith('/') ? BASE : BASE + '/'
  const candidate = `${base}tenants/${key}.json`
  const fallback = `${base}tenants/default.json`
  const tries = [candidate, './tenants/' + key + '.json', fallback, './tenants/default.json']

  for (const u of tries) {
    try {
      const r = await fetchWithTimeout(u, 6000)
      const raw = await r.text()
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${raw.slice(0, 200)}`)
      tenant.value = JSON.parse(raw)
      status.value = 'ok'
      try {
        const brand = tenant.value?.brand
        const name =
          currentLanguage.value === 'ar' ? brand?.name_ar : brand?.name_en || brand?.name_ar
        document.title = name ? `${name} · Menu` : 'Menu'
      } catch {
        /* empty */
      }
      await nextTick()
      initCardObserver()
      return
    } catch (e) {
      errorMsg.value = `${u} → ${e?.message || e}`
    }
  }
  status.value = 'error'
}
onMounted(() => {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'ar' || saved === 'en') currentLanguage.value = saved
  } catch {
    /* empty */
  }
  // حمّل بيانات العميل السابقة (إن وجدت)
  try {
    const raw = localStorage.getItem('customerInfo')
    if (raw) Object.assign(customer, JSON.parse(raw))
  } catch {
    /* empty */
  }
  loadTenant()
})

/* ===== ثيم وبيانات عامة ===== */
const brandName = computed(() => {
  const b = tenant.value?.brand
  return currentLanguage.value === 'ar' ? b?.name_ar : b?.name_en || b?.name_ar || 'Restaurant'
})
const currency = computed(() => tenant.value?.business?.currency || 'AED')
const vatRate = computed(() => Number(tenant.value?.business?.tax_rate || 0))
const themePrimary = computed(() => tenant.value?.theme?.primary || '#f97316')
const themeSecondary = computed(() => tenant.value?.theme?.secondary || '#fb923c')
const btnStyle = computed(() => ({
  background: `linear-gradient(90deg, ${themePrimary.value}, ${themeSecondary.value})`,
}))

/* ===== تبويبات / فلترة ===== */
const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
const products = computed(() =>
  (tenant.value?.menu?.products || []).filter((p) => p.available !== false),
)
const tabs = computed(() => {
  const cats = (tenant.value?.menu?.categories || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
  const has = new Set(products.value.map((p) => norm(p.category_id)))
  const visible = cats.filter((c) => has.has(norm(c.id)))
  return [{ id: 'all', name_ar: t('allCategories'), name_en: t('All') }, ...visible]
})
const activeCat = ref('all')
const filteredProducts = computed(() => {
  let list =
    activeCat.value === 'all'
      ? products.value
      : products.value.filter((p) => norm(p.category_id) === norm(activeCat.value))
  if (searchQuery.value) {
    const q = norm(searchQuery.value)
    list = list.filter(
      (p) =>
        norm(p.name_ar).includes(q) ||
        norm(p.name_en).includes(q) ||
        norm(p.description_ar).includes(q) ||
        norm(p.description_en).includes(q),
    )
  }
  return list
})

/* ===== سلة ===== */
const cart = reactive([]) // [{ key, sku, name, unitPrice, qty }]
const cartBump = ref(false)
const toast = reactive({ show: false, text: '' })
const itemCount = computed(() => cart.reduce((a, c) => a + c.qty, 0))
const subtotal = computed(() => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0))
const tax = computed(() => +(subtotal.value * vatRate.value).toFixed(2))
const total = computed(() => subtotal.value + tax.value)

function showToast(text) {
  toast.text = text
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

function addToCart(p) {
  const key = p.id + '::{}'
  const name = currentLanguage.value === 'ar' ? p.name_ar : p.name_en || p.name_ar
  const found = cart.find((it) => it.key === key)
  if (found) found.qty += 1
  else cart.push({ key, sku: p.id, name, unitPrice: Number(p.price) || 0, qty: 1 })
  bump()
}
function onAddClick(p) {
  addToCart(p)
  showToast(t('add') + ' ' + (currentLanguage.value === 'ar' ? p.name_ar : p.name_en || p.name_ar))
}
function decFromGrid(p) {
  const key = p.id + '::{}'
  const found = cart.find((it) => it.key === key)
  if (!found) return
  found.qty > 1 ? found.qty-- : removeLine(found)
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

/* ===== بيانات العميل + واتساب ===== */
const checkoutOpen = ref(false)
const customer = reactive({ name: '', location: '', note: '' })
const checkoutLabels = computed(() => ({
  title: t('checkoutTitle'),
  orderSummary: currentLanguage.value === 'ar' ? 'ملخص الطلب' : 'Order Summary',
  qty: currentLanguage.value === 'ar' ? 'الكمية' : 'Qty',
  unitPrice: currentLanguage.value === 'ar' ? 'سعر الوحدة' : 'Unit price',
  subtotal: t('subtotal'),
  tax: t('tax'),
  grandTotal: t('grandTotal'),
  name: t('name'),
  namePh: currentLanguage.value === 'ar' ? 'اكتب اسمك' : 'Enter your name',
  location: t('location'),
  locationPh:
    currentLanguage.value === 'ar'
      ? 'مثال: الشارقة - القاسمية - بناية ...'
      : 'Example: Sharjah - Al Qasimia - Building ...',
  note: t('note'),
  notePh:
    currentLanguage.value === 'ar' ? 'تعليمات خاصة للتوصيل (اختياري)' : 'Delivery note (optional)',
  total: t('total'),
  cancel: t('cancel'),
  confirm: t('confirmSend'),
}))

function openCheckout() {
  if (!cart.length) return
  checkoutOpen.value = true
}

function buildWaLink(info) {
  if (!tenant.value || !cart.length) return '#'
  const cur = currency.value
  const brand = brandName.value
  const lines = []
  lines.push(`${brand} - ${t('newOrder')}`, '')
  for (const it of cart)
    lines.push(`- ${it.name} ×${it.qty} = ${formatPrice(it.unitPrice * it.qty)} ${cur}`)
  if (vatRate.value) {
    lines.push('', `${t('subtotal')}: ${formatPrice(subtotal.value)} ${cur}`)
    lines.push(`${t('tax')}: ${formatPrice(tax.value)} ${cur}`)
  }
  lines.push(
    `${t('grandTotal')}: ${formatPrice(total.value)} ${cur}`,
    '',
    `${t('name')}: ${info?.name || '—'}`,
    `${t('location')}: ${info?.location || '—'}`,
    `${t('note')}: ${info?.note || '—'}`,
  )
  const text = encodeURIComponent(lines.join('\n'))
  const phone = (tenant.value?.contact?.whatsapp_e164 || '').replace('+', '')
  return phone ? `https://wa.me/${phone}?text=${text}` : '#'
}
function handleCheckoutSubmit(info) {
  Object.assign(customer, info || {})
  try {
    localStorage.setItem('customerInfo', JSON.stringify(customer))
  } catch {
    /* empty */
  }
  const link = buildWaLink(customer)
  if (link === '#') {
    showToast(
      currentLanguage.value === 'ar'
        ? 'يرجى ضبط رقم واتساب في الإعدادات'
        : 'Please set WhatsApp number',
    )
    return
  }
  window.open(link, '_blank')
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

/* ===== ظهور البطاقات (IO) ===== */
const inView = reactive({})
let io = null
function initCardObserver() {
  if (io) {
    io.disconnect()
    io = null
  }
  const cards = Array.from(document.querySelectorAll('.card-base'))
  if (!cards.length) return
  if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
    cards.forEach((el) => {
      const sku = el.getAttribute('data-sku')
      if (sku) inView[sku] = true
    })
    return
  }
  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const sku = e.target.getAttribute('data-sku')
        if (sku) inView[sku] = true
        io.unobserve(e.target)
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  )
  cards.forEach((el) => {
    const sku = el.getAttribute('data-sku')
    if (sku && !inView[sku]) io.observe(el)
  })
}
watch([activeCat, searchQuery, filteredProducts], async () => {
  await nextTick()
  initCardObserver()
})
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
.card-base {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(14px) scale(0.98);
  opacity: 0;
  transition:
    transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.6s;
  transition-delay: var(--stagger, 0ms);
}
.card-base.in-view {
  transform: translateY(0) scale(1);
  opacity: 1;
}
.card-img {
  transition: transform 0.6s ease;
}
.card-base:hover .card-img {
  transform: scale(1.06);
}
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
@media (hover: none) {
  .add-fab {
    opacity: 1;
    transform: translateY(0);
  }
}
.ping {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  animation: ping 0.5s ease-out;
}
@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
.cartbar {
  transform: translateZ(0);
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
