<script setup lang="ts">
import { computed } from 'vue'

import type { Fortune } from '../types/fortune'

const props = defineProps<{
  fortune: Fortune
  dateLabel: string
  shareMode?: boolean
}>()

const luckTone = computed(() => {
  if (props.fortune.luck === 'upper') {
    return 'text-amber-200'
  }

  if (props.fortune.luck === 'middle') {
    return 'text-violet-200'
  }

  return 'text-rose-200'
})
</script>

<template>
  <article
    :class="[
      'relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(31,39,64,0.95),rgba(11,14,23,0.98))] text-stone-100 shadow-[0_30px_80px_rgba(0,0,0,0.45)]',
      shareMode ? 'mx-auto w-[420px] p-8' : 'w-full p-6 md:p-8',
    ]"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_42%)]" />
    <div class="relative space-y-6">
      <header class="space-y-3 text-center">
        <p class="text-xs uppercase tracking-[0.45em] text-stone-400">Fate Draw</p>
        <div class="flex items-center justify-center gap-3">
          <span class="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/80" />
          <p class="text-sm tracking-[0.4em] text-stone-300">{{ dateLabel }}</p>
          <span class="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/80" />
        </div>
        <div class="space-y-1">
          <p class="text-sm tracking-[0.4em] text-amber-200/90">{{ fortune.signNumber }}</p>
          <h2 class="text-3xl font-semibold tracking-[0.2em] text-amber-100">{{ fortune.aura }}</h2>
          <p :class="['text-sm tracking-[0.35em]', luckTone]">{{ fortune.tier }}</p>
        </div>
      </header>

      <section class="rounded-[24px] border border-amber-200/10 bg-black/15 px-6 py-5">
        <p
          v-for="line in fortune.poem"
          :key="line"
          class="py-1 text-center text-base tracking-[0.3em] text-stone-100 md:text-lg"
        >
          {{ line }}
        </p>
      </section>

      <section class="space-y-4">
        <div>
          <p class="mb-2 text-xs tracking-[0.4em] text-amber-200/80">解签</p>
          <p class="leading-7 text-stone-300">{{ fortune.interpretation }}</p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <p class="mb-2 text-xs tracking-[0.35em] text-emerald-200">宜</p>
            <p class="text-sm leading-7 text-stone-200">{{ fortune.suitable.join('、') }}</p>
          </div>
          <div class="rounded-2xl border border-rose-400/20 bg-rose-500/5 p-4">
            <p class="mb-2 text-xs tracking-[0.35em] text-rose-200">忌</p>
            <p class="text-sm leading-7 text-stone-200">{{ fortune.avoid.join('、') }}</p>
          </div>
        </div>
      </section>

      <footer class="space-y-4">
        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="tag in fortune.tags"
            :key="tag"
            class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs tracking-[0.22em] text-stone-300"
          >
            {{ tag }}
          </span>
        </div>
        <p class="text-center text-xs tracking-[0.35em] text-stone-500">命运之签 · 今日之签</p>
      </footer>
    </div>
  </article>
</template>
