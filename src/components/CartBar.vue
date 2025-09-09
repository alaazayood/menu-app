<template>
  <div
    v-if="cart?.length"
    :class="['fixed bottom-0 left-0 right-0 glass border-t cartbar', { bump }]"
    :dir="dir"
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
              @click="$emit('dec', it)"
            >
              −
            </button>
            <span class="w-6 text-center qty" :key="it.qty">{{ it.qty }}</span>
            <button
              class="px-2 py-1 rounded-full border active:scale-95 transition"
              @click="$emit('inc', it)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- الإجمالي + واتساب -->
      <div class="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="text-sm">
          {{ labels?.items }}: {{ itemCount }} · {{ labels?.total }}:
          <span class="font-bold">{{ totalFormatted }}</span>
          <span v-if="vatRate"> ({{ labels?.includesVat }} {{ (vatRate * 100).toFixed(0) }}%)</span>
        </div>

        <button
          class="inline-block text-white font-bold px-5 py-2 rounded-full soft-shadow text-center active:scale-95 transition"
          :style="btnStyle"
          @click="$emit('checkout')"
        >
          {{ labels?.sendWhatsApp }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  cart: { type: Array, default: () => [] },
  itemCount: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  vatRate: { type: Number, default: 0 },
  currency: { type: String, default: '' },
  totalFormatted: { type: String, default: '' },
  labels: { type: Object, default: () => ({}) },
  btnStyle: { type: Object, default: () => ({}) },
  bump: { type: Boolean, default: false },
  dir: { type: String, default: 'rtl' },
})
defineEmits(['inc', 'dec', 'checkout'])
</script>

<style scoped>
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(12px);
}
.soft-shadow {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
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
</style>
