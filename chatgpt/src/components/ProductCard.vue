<template>
  <div
    class="menu-item bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1"
  >
    <div class="flex gap-4 items-start">
      <!-- صورة المنتج -->
      <div class="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
      </div>

      <!-- معلومات المنتج -->
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ product.name }}</h3>
        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ product.description }}</p>
        <div class="flex items-center justify-between">
          <span class="text-2xl font-bold text-orange-600">{{ product.price }} د.إ</span>

          <!-- أزرار الكمية -->
          <div class="flex items-center gap-2">
            <button
              @click="decreaseQuantity"
              :disabled="quantity === 0"
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            >
              ➖
            </button>

            <span class="w-8 text-center font-medium">{{ quantity }}</span>

            <button
              @click="increaseQuantity"
              class="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
            >
              ➕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- زر الإضافة إلى السلة -->
    <button
      v-if="quantity > 0"
      @click="addToCart"
      class="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
    >
      أضف إلى السلة - {{ quantity * product.price }} د.إ
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const quantity = ref(0)
const emit = defineEmits(['add-to-cart'])

const increaseQuantity = () => {
  quantity.value++
}

const decreaseQuantity = () => {
  if (quantity.value > 0) {
    quantity.value--
  }
}

const addToCart = () => {
  if (quantity.value > 0) {
    emit('add-to-cart', {
      ...props.product,
      quantity: quantity.value,
    })
    quantity.value = 0
  }
}

const handleImageError = (event) => {
  event.target.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjhBIj7Yp9mE2YLYqSDZhtmH2LE8L3RleHQ+Cjwvc3ZnPg=='
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
