<template>
  <!-- سكيلتون أثناء التحميل -->
  <div
    v-if="status === 'loading'"
    class="min-h-screen bg-[linear-gradient(135deg,#fff7ed,35%,#fde68a)]"
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
  <div v-else-if="status === 'error'" class="p-8 text-center text-red-600">
    تعذّر تحميل القائمة
    <pre class="mt-2 bg-white p-3 rounded-md shadow overflow-x-auto text-left text-xs">{{
      errorMsg
    }}</pre>
  </div>

  <!-- التطبيق -->
  <div v-else class="min-h-screen bg-[linear-gradient(135deg,#fff7ed,35%,#fde68a)] text-right">
    <!-- هيدر زجاجي -->
    <header class="sticky top-0 z-20 glass border-b">
      <div class="container mx-auto px-4 py-3 flex items-center justify-center">
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
              {{ tenant.brand?.tagline || 'منيو إلكترونية — اطلب عبر واتساب' }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- تبويب تصنيفات -->
    <nav v-if="tabs.length" class="sticky top-[68px] sm:top-[72px] z-10 glass border-b">
      <div class="container mx-auto px-4 py-2">
        <ul class="flex gap-2 overflow-x-auto no-scrollbar">
          <li v-for="c in tabs" :key="c.id">
            <button
              @click="activeCat = c.id"
              class="px-4 py-2 rounded-full text-sm font-bold transition-all"
              :style="tabStyle(c.id)"
            >
              {{ c.name_ar }}
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- المنتجات -->
    <main class="container mx-auto px-4 py-8">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <article
          v-for="(p, idx) in filteredProducts"
          :key="p.id"
          class="js-card group card-base"
          :data-id="p.id"
          :style="{ '--stagger': (idx % 12) * 60 + 'ms' }"
          :class="{ 'in-view': inView[p.id] }"
        >
          <div class="relative h-48 sm:h-52 overflow-hidden">
            <img
              :src="resolveImg(p)"
              :alt="p.name_ar"
              class="w-full h-full object-cover card-img"
              @error="onImgError"
            />
            <!-- بادج السعر -->
            <div class="price-badge" :style="{ color: themePrimary }">
              {{ formatPrice(p.price) }} {{ currency }}
            </div>
            <!-- زر إضافة عائم -->
            <button class="add-fab" :style="btnStyle" @click="onAddClick(p, $event)">
              أضف
              <span v-if="fabPing" class="ping"></span>
            </button>
          </div>

          <div class="p-4">
            <h3 class="font-bold text-lg text-gray-800 mb-1">{{ p.name_ar }}</h3>
            <p v-if="p.description_ar" class="text-sm text-gray-600 mb-3">{{ p.description_ar }}</p>

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
                  @click="onAddClick(p, $event)"
                >
                  أضف
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <p v-if="!filteredProducts.length" class="text-center text-gray-500 py-16">
        لا توجد منتجات في هذا التصنيف
      </p>
    </main>

    <!-- شريط السلة السفلي -->
    <div
      v-if="cart.length"
      :class="['fixed bottom-0 left-0 right-0 glass border-t cartbar', { bump: cartBump }]"
    >
      <div class="container mx-auto px-4 py-3">
        <!-- العناصر -->
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

        <!-- الإجمالي + واتساب -->
        <div class="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="text-sm">
            العناصر: {{ itemCount }} · المجموع:
            <span class="font-bold">{{ formatPrice(total) }} {{ currency }}</span>
            <span v-if="vatRate"> (يشمل ضريبة {{ (vatRate * 100).toFixed(0) }}%)</span>
          </div>
          <a
            :href="waLink"
            target="_blank"
            class="inline-block text-white font-bold px-5 py-2 rounded-full soft-shadow text-center active:scale-95 transition"
            :style="btnStyle"
          >
            إرسال واتساب
          </a>
        </div>
      </div>
    </div>

    <!-- Toast صغير -->
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
import { ref, reactive, computed, onMounted, nextTick } from 'vue'

/* ===== تحميل بيانات المطعم: محاولتان + تايم أوت ===== */
const status = ref('loading')
const tenant = ref(null)
const errorMsg = ref('')

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
  const tries = ['./tenants/default.json', '/tenants/default.json']
  for (const u of tries) {
    try {
      const r = await fetchWithTimeout(u, 6000)
      const raw = await r.text()
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${raw.slice(0, 200)}`)
      tenant.value = JSON.parse(raw)
      status.value = 'ok'
      await nextTick()
      initCardObserver()
      return
    } catch (e) {
      errorMsg.value = `${u} → ${e?.message || e}`
    }
  }
  status.value = 'error'
}
onMounted(loadTenant)

/* ===== ثيم وبيانات عامة ===== */
const brandName = computed(() => tenant.value?.brand?.name_ar || 'مطعم')
const currency = computed(() => tenant.value?.business?.currency || 'IQD')
const vatRate = computed(() => Number(tenant.value?.business?.tax_rate || 0))
const themePrimary = computed(() => tenant.value?.theme?.primary || '#ff6a00')
const themeSecondary = computed(() => tenant.value?.theme?.secondary || '#ff2d55')
const btnStyle = computed(() => ({
  background: `linear-gradient(90deg, ${themePrimary.value}, ${themeSecondary.value})`,
}))

/* ===== التصنيفات والفلترة ===== */
const cats = computed(() => {
  const arr = tenant.value?.menu?.categories ? [...tenant.value.menu.categories] : []
  arr.sort((a, b) => (a.order || 0) - (b.order || 0))
  return arr
})
const tabs = computed(() => [{ id: 'all', name_ar: 'الكل' }, ...cats.value])
const activeCat = ref('all')
const products = computed(() =>
  (tenant.value?.menu?.products || []).filter((p) => p.available !== false),
)
const filteredProducts = computed(() =>
  activeCat.value === 'all'
    ? products.value
    : products.value.filter((p) => p.category_id === activeCat.value),
)

/* ===== السلة ===== */
const cart = reactive([]) // [{ key, sku, name, unitPrice, qty }]
const cartBump = ref(false)
const toast = reactive({ show: false, text: '' })
const fabPing = ref(false)

function showToast(text = 'تمت الإضافة') {
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

function onAddClick(p) {
  addToCart(p)
  showToast('تمت إضافة ' + (p.name_ar || 'الصنف'))
  fabPing.value = true
  setTimeout(() => (fabPing.value = false), 500)
}

function addToCart(p) {
  const key = p.id + '::{}'
  const found = cart.find((it) => it.key === key)
  if (found) found.qty += 1
  else cart.push({ key, sku: p.id, name: p.name_ar, unitPrice: Number(p.price) || 0, qty: 1 })
  bump()
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

const itemCount = computed(() => cart.reduce((a, c) => a + c.qty, 0))
const subtotal = computed(() => cart.reduce((s, it) => s + it.unitPrice * it.qty, 0))
const tax = computed(() => +(subtotal.value * vatRate.value).toFixed(2))
const total = computed(() => subtotal.value + tax.value)

/* ===== واتساب ===== */
const waLink = computed(() => {
  if (!tenant.value || !cart.length) return '#'
  const cur = currency.value
  const brand = brandName.value
  const lines = []
  lines.push(`${brand} - طلب جديد`, '')
  for (const it of cart)
    lines.push(`- ${it.name} ×${it.qty} = ${formatPrice(it.unitPrice * it.qty)} ${cur}`)
  if (vatRate.value) {
    lines.push('', `الإجمالي الفرعي: ${formatPrice(subtotal.value)} ${cur}`)
    lines.push(`الضريبة: ${formatPrice(tax.value)} ${cur}`)
  }
  lines.push(
    `الإجمالي: ${formatPrice(total.value)} ${cur}`,
    '',
    'الاسم: ———',
    'الموقع: ———',
    'ملاحظة: ———',
  )
  const text = encodeURIComponent(lines.join('\n'))
  const phone = (tenant.value?.contact?.whatsapp_e164 || '').replace('+', '')
  return phone ? `https://wa.me/${phone}?text=${text}` : '#'
})

/* ===== الصور ===== */
const PLACEHOLDER =
  'data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">\
<rect width="100%" height="100%" fill="%23f3f4f6"/>\
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24">No Image</text>\
</svg>'
function resolveImg(p) {
  if (p?.image_url) return p.image_url
  if (p?.image) return `images/${p.image}`
  return PLACEHOLDER
}
function resolveAsset(pathStr) {
  if (!pathStr) return ''
  if (/^(https?:)?\/\//i.test(pathStr) || pathStr.startsWith('data:')) return pathStr
  if (pathStr.startsWith('/')) return pathStr
  return `/${pathStr.replace(/^\.?\//, '')}`
}
function onImgError(e) {
  e.target.src = PLACEHOLDER
  e.target.onerror = null
}

/* ===== ظهور البطاقات عند التمرير ===== */
const inView = reactive({})
function initCardObserver() {
  const cards = Array.from(document.querySelectorAll('.js-card'))
  if (!cards.length) return
  const ob = new IntersectionObserver(
    (ents) => {
      ents.forEach((e) => {
        const id = e.target.getAttribute('data-id')
        if (e.isIntersecting) {
          inView[id] = true
          ob.unobserve(e.target)
        }
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  )
  cards.forEach((el) => ob.observe(el))
}

/* ===== أدوات ===== */
function tabStyle(id) {
  const active = activeCat.value === id
  return active
    ? {
        background: `linear-gradient(90deg, ${themePrimary.value}, ${themeSecondary.value})`,
        color: '#fff',
      }
    : { border: '1px solid #e5e7eb', color: '#111827', background: '#fff' }
}
function formatPrice(n) {
  try {
    return new Intl.NumberFormat('ar', { maximumFractionDigits: 2 }).format(n)
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

/* زجاج وجماليات */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
}
.soft-shadow {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

/* شيمر السكيلتون */
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

/* بطاقة مع دخول تدريجي + تراتُب */
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

/* زر إضافة عائم */
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

/* pulse صغيرة عند النقر */
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

/* شريط السلة bump */
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

/* سكرول نظيف للتبويبات */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
