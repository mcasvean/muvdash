<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  message: string
  triggerMode: 'click' | 'hover'
}>()

const route = useRoute()
const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function closeWhenOutside(event: Event) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) {
    isOpen.value = false
  }
}

function closeOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  },
)

onMounted(() => {
  document.addEventListener('click', closeWhenOutside, true)
  document.addEventListener('focusin', closeWhenOutside, true)
  document.addEventListener('keydown', closeOnEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeWhenOutside, true)
  document.removeEventListener('focusin', closeWhenOutside, true)
  document.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <v-tooltip
    v-model="isOpen"
    :text="message"
    location="top"
    :open-on-click="triggerMode === 'click'"
    :open-on-hover="triggerMode === 'hover'"
    :open-on-focus="triggerMode === 'hover'"
  >
    <template #activator="{ props: activatorProps }">
      <span ref="root" class="contextual-tooltip">
        <slot :activator-props="activatorProps" />
      </span>
    </template>
  </v-tooltip>
</template>

<style scoped>
.contextual-tooltip {
  display: inline-flex;
}
</style>
