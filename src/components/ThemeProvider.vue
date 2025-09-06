<template>
  <div :style="styleVars"><slot /></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: {
    type: Object,
    required: true,
    default: () => ({
      primary: '#16a34a',
      secondary: '#22c55e',
      surface: '#ffffff',
      text: '#111827',
      radius: '16px',
      shadow: '0 10px 20px rgba(0,0,0,0.08)',
    }),
  },
})

const styleVars = computed(() => ({
  '--c-primary': props.theme.primary,
  '--c-secondary': props.theme.secondary,
  '--c-surface': props.theme.surface,
  '--c-text': props.theme.text,
  '--radii-lg': props.theme.radius ?? '16px',
  '--shadow-xl': props.theme.shadow ?? '0 10px 20px rgba(0,0,0,0.08)',
}))
</script>

<style>
:root {
  --c-primary: #16a34a;
  --c-secondary: #22c55e;
  --c-surface: #ffffff;
  --c-text: #111827;
  --radii-lg: 16px;
  --shadow-xl: 0 10px 20px rgba(0, 0, 0, 0.08);
}
.theme-surface {
  background: var(--c-surface);
  color: var(--c-text);
}
.btn-primary {
  background: linear-gradient(90deg, var(--c-primary), var(--c-secondary));
  color: white;
  border-radius: var(--radii-lg);
  box-shadow: var(--shadow-xl);
  padding: 0.625rem 1rem;
  font-weight: 700;
}
.card {
  background: white;
  border-radius: var(--radii-lg);
  box-shadow: var(--shadow-xl);
}
.price-pill {
  background: white;
  border-radius: 9999px;
  box-shadow: var(--shadow-xl);
  padding: 0.25rem 0.5rem;
  font-weight: 700;
  color: var(--c-primary);
}
</style>
