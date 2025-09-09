<template>
  <article
    class="group card-base"
    :class="{ 'in-view': inView }"
    :style="{ '--stagger': (staggerMs || 0) + 'ms' }"
    :dir="dir"
    :data-sku="sku"
  >
    <div class="relative h-48 sm:h-52 overflow-hidden">
      <img
        :src="imageUrl || PLACEHOLDER"
        :alt="title"
        class="w-full h-full object-cover card-img"
        loading="lazy"
        decoding="async"
        @error="onImgError"
      />
      <!-- بادج السعر -->
      <div class="price-badge" :style="{ color: themePrimary }">
        {{ formattedPrice }}
      </div>
      <!-- زر إضافة عائم -->
      <button class="add-fab" :style="btnStyle" @click="onAdd">
        {{ addLabel }}
        <span v-if="ping" class="ping"></span>
      </button>
    </div>

    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-800 mb-1 truncate" :title="title">{{ title }}</h3>
      <p v-if="desc" class="text-sm text-gray-600 line-clamp-2 mb-3">{{ desc }}</p>

      <div class="flex items-center justify-between">
        <span class="text-xs text-transparent">#{{ sku }}</span>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-2 rounded-full border text-sm font-semibold hover:bg-gray-50 active:scale-95 transition"
            @click="$emit('dec')"
          >
            −
          </button>
          <button
            class="px-4 py-2 rounded-full text-white font-bold soft-shadow active:scale-95 transition"
            :style="btnStyle"
            @click="onAdd"
          >
            {{ addLabel }}
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  imageUrl: String,
  title: String,
  desc: String,
  sku: [String, Number],
  price: [Number, String],
  currency: String,
  addLabel: { type: String, default: 'أضف' },
  btnStyle: { type: Object, default: () => ({}) },
  themePrimary: { type: String, default: '#f97316' },
  inView: { type: Boolean, default: false },
  staggerMs: { type: Number, default: 0 },
  dir: { type: String, default: 'rtl' },
})
const emit = defineEmits(['add', 'dec'])

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="24">No Image</text></svg>'

function onImgError(e) {
  e.target.src = PLACEHOLDER
  e.target.onerror = null
}

const formattedPrice = computed(() => {
  const n = Number(props.price ?? 0)
  try {
    return (
      new Intl.NumberFormat('ar', { maximumFractionDigits: 2 }).format(n) +
      ' ' +
      (props.currency || '')
    )
  } catch {
    return n + ' ' + (props.currency || '')
  }
})

const ping = ref(false)
function onAdd() {
  ping.value = true
  emit('add')
  setTimeout(() => (ping.value = false), 500)
}
</script>

<style scoped>
/* دخول متدرّج + تراتُب */
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

/* تكبير الصورة عند الهوفر */
.card-img {
  transition: transform 0.6s ease;
}
.card-base:hover .card-img {
  transform: scale(1.06);
}

/* بادج السعر مع pop */
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

/* زر الإضافة العائم + إظهار دائم على اللمس */
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

/* نبضة سريعة عند الإضافة */
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

.soft-shadow {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}
</style>
