<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 text-right">
    <!-- هيدر بسيط (يظهر دائمًا) -->
    <header class="bg-white shadow-md">
      <div class="container mx-auto px-4 py-4 text-center">
        <h1 class="text-3xl font-bold text-orange-600">
          {{ tenant?.brand?.name_ar || 'مطعم الشارقة' }}
        </h1>
        <p class="text-gray-600">أطيب المأكولات العربية</p>
      </div>
    </header>

    <!-- حالات -->
    <div v-if="status === 'loading'" class="p-8 text-center">…جارٍ التحميل</div>
    <div v-else-if="status === 'error'" class="p-8 text-center text-red-600">
      تعذّر تحميل القائمة
    </div>

    <!-- القائمة -->
    <main v-else class="container mx-auto px-4 py-8">
      <section v-for="cat in cats" :key="cat.id" class="mb-10">
        <h2 class="text-2xl font-bold mb-4">{{ cat.name_ar }}</h2>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="p in productsByCat(cat.id)"
            :key="p.id"
            class="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div class="relative h-44 bg-gray-50">
              <img
                v-if="p.image_url"
                :src="p.image_url"
                :alt="p.name_ar"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow font-bold text-orange-600"
              >
                {{ price(p.price) }} {{ currency }}
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg text-gray-800 mb-1">{{ p.name_ar }}</h3>
              <p v-if="p.description_ar" class="text-sm text-gray-600 mb-3">
                {{ p.description_ar }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">#{{ p.id }}</span>
                <button
                  class="text-white font-bold px-4 py-2 rounded-full"
                  style="background: linear-gradient(90deg, #f97316, #fb923c)"
                  @click="addToCart(p)"
                >
                  أضف للطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p v-if="!hasProducts" class="text-center text-gray-500">القائمة قيد التحضير…</p>
    </main>

    <!-- شريط واتساب -->
    <div
      v-if="cart.length"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow px-4 py-2 flex items-center gap-4"
    >
      <span>العناصر: {{ itemCount }}</span>
      <span>المجموع: {{ price(subtotal) }} {{ currency }}</span>
      <a
        :href="waLink"
        target="_blank"
        class="text-white font-bold px-4 py-2 rounded-full"
        style="background: linear-gradient(90deg, #22c55e, #16a34a)"
      >
        إرسال عبر واتساب
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const tenant = ref(null)
const status = ref('loading') // loading | ok | error

onMounted(async () => {
  try {
    const r = await fetch('/tenants/default.json', { cache: 'no-store' })
    if (!r.ok) throw new Error('not found')
    tenant.value = await r.json()
    status.value = 'ok'
  } catch (e) {
    console.error(e)
    status.value = 'error'
  }
})

// بيانات
const currency = computed(() => tenant.value?.business?.currency || 'SAR')
const cats = computed(() =>
  (tenant.value?.menu?.categories || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0)),
)
const products = computed(() =>
  (tenant.value?.menu?.products || []).filter((p) => p.available !== false),
)
const hasProducts = computed(() => products.value.length > 0)
const productsByCat = (catId) => products.value.filter((p) => p.category_id === catId)

// سلة بسيطة
const cart = ref([])
function addToCart(p) {
  const i = cart.value.findIndex((x) => x.id === p.id)
  if (i >= 0) cart.value[i].qty++
  else cart.value.push({ id: p.id, name: p.name_ar, unitPrice: p.price, qty: 1, options: [] })
}
const itemCount = computed(() => cart.value.reduce((a, c) => a + c.qty, 0))
const subtotal = computed(() => cart.value.reduce((s, it) => s + it.unitPrice * it.qty, 0))

// واتساب
const waLink = computed(() => {
  if (!tenant.value) return '#'
  const cur = currency.value
  const lines = []
  lines.push(`${tenant.value.brand?.name_ar || 'طلب'} - طلب جديد`, '')
  for (const it of cart.value) {
    lines.push(`- ${it.name} ×${it.qty} = ${it.unitPrice * it.qty} ${cur}`)
  }
  lines.push('', `الإجمالي النهائي: ${subtotal.value} ${cur}`)
  const text = encodeURIComponent(lines.join('\n'))
  const phone = (tenant.value.contact?.whatsapp_e164 || '').replace('+', '')
  return `https://wa.me/${phone}?text=${text}`
})

// تنسيقات
const price = (n) => {
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
</style>
