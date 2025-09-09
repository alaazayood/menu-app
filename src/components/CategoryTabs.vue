<template>
  <nav class="glass border-b" :dir="dir">
    <div class="container mx-auto px-4 py-2">
      <div ref="rail" class="relative">
        <!-- الأزرار -->
        <ul ref="list" class="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <li v-for="c in tabs" :key="c.id" class="snap-start">
            <button
              ref="tabBtns"
              class="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
              :class="activeId === c.id ? 'text-white' : 'text-gray-900 border'"
              :style="buttonStyle(c.id)"
              @click="select(c.id)"
            >
              {{ currentLanguage === 'ar' ? c.name_ar : c.name_en || c.name_ar }}
            </button>
          </li>
        </ul>

        <!-- المؤشر المتحرك -->
        <div
          class="absolute h-8 rounded-full -z-10 transition-transform duration-300 ease-out will-change-transform"
          :style="indicatorStyle"
          aria-hidden="true"
        />
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  tabs: { type: Array, default: () => [] }, // [{id,name_ar,name_en}]
  activeId: { type: String, default: 'all' },
  currentLanguage: { type: String, default: 'ar' },
  themePrimary: { type: String, default: '#f97316' },
  themeSecondary: { type: String, default: '#fb923c' },
  dir: { type: String, default: 'rtl' },
})
const emit = defineEmits(['update:activeId'])

const rail = ref(null)
const list = ref(null)
const tabBtns = ref([])

function select(id) {
  emit('update:activeId', id)
  // تمرير الزر النشط للمنتصف
  nextTick(() => {
    const btn = getActiveBtn()
    if (!btn || !list.value) return
    const rect = btn.getBoundingClientRect()
    const lrect = list.value.getBoundingClientRect()
    const delta = rect.left - (lrect.left + lrect.width / 2 - rect.width / 2)
    list.value.scrollBy({ left: delta, behavior: 'smooth' })
  })
}

// ستايل زر
function buttonStyle(id) {
  const active = props.activeId === id
  return active
    ? {
        background: `linear-gradient(90deg, ${props.themePrimary}, ${props.themeSecondary})`,
        boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
      }
    : { borderColor: '#e5e7eb', background: '#fff' }
}

// المؤشر
const indLeft = ref(0)
const indWidth = ref(0)
const indicatorStyle = computed(() => ({
  width: indWidth.value + 'px',
  transform: `translateX(${indLeft.value}px)`,
  background: `linear-gradient(90deg, ${props.themePrimary}, ${props.themeSecondary})`,
  boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
}))

function getActiveBtn() {
  if (!tabBtns.value?.length) return null
  return tabBtns.value.find((el) => el?.textContent && isActiveEl(el))
}
function isActiveEl(el) {
  // نطابق بالـ id من خلال النص المعروض قد يختلف، لذا نعتمد على index
  // أبسط: نستخدم الـ class للحالة النشطة
  return el?.classList?.contains('text-white')
}

function recalcIndicator() {
  const btn = getActiveBtn()
  const railEl = rail.value
  if (!btn || !railEl) return
  const b = btn.getBoundingClientRect()
  const r = railEl.getBoundingClientRect()
  indLeft.value = b.left - r.left
  indWidth.value = b.width
}

onMounted(async () => {
  await nextTick()
  // اجمع مراجع الأزرار
  tabBtns.value = list.value?.querySelectorAll('button') || []
  recalcIndicator()

  // راقب الريسايز والاسكرول لتحديث المؤشر
  const ro = new ResizeObserver(() => recalcIndicator())
  ro.observe(document.documentElement)
  list.value?.addEventListener('scroll', onScrollThrottled, { passive: true })
})

function onScrollThrottled() {
  // تحديث خفيف أثناء سحب الشريط
  window.requestAnimationFrame(recalcIndicator)
}

// أعد الحساب عند تغيّر الحالة
watch(
  () => [props.activeId, props.tabs.length, props.dir],
  async () => {
    await nextTick()
    tabBtns.value = list.value?.querySelectorAll('button') || []
    recalcIndicator()
  },
)
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
