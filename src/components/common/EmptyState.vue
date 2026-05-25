<template>
  <div class="empty-state">
    <!-- Icon -->
    <div
      class="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-800"
    >
      <slot name="icon">
        <component
          :is="icon"
          v-if="icon"
          class="empty-state-icon h-10 w-10"
          aria-hidden="true"
        />
        <Icon
          v-else
          name="inbox"
          size="xl"
          class="empty-state-icon text-gray-400"
        />
      </slot>
    </div>

    <!-- Title -->
    <h3 class="empty-state-title">
      {{ displayTitle }}
    </h3>

    <!-- Description -->
    <p class="empty-state-description">
      {{ description }}
    </p>

    <!-- Action -->
    <div
      v-if="actionText || $slots.action"
      class="mt-6"
    >
      <slot name="action">
        <component
          :is="actionTo ? 'RouterLink' : 'button'"
          v-if="actionText"
          :to="actionTo"
          class="btn btn-primary"
          @click="!actionTo && $emit('action')"
        >
          <Icon
            v-if="actionIcon"
            name="plus"
            size="md"
            class="mr-2"
          />
          {{ actionText }}
        </component>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import Icon from '@/components/icons/Icon.vue'

interface Props {
  icon?: Component | string
  title?: string
  description?: string
  actionText?: string
  actionTo?: string | object
  actionIcon?: boolean
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  actionIcon: true,
  title: '暂无数据'
})

const displayTitle = computed(() => props.title || '暂无数据')

defineEmits(['action'])
</script>