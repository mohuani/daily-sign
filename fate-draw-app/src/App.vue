<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { gsap } from 'gsap'
import { toPng } from 'html-to-image'

import FortuneCard from './components/FortuneCard.vue'
import { fortunes } from './data/fortunes'
import type { DailyDrawRecord, Fortune } from './types/fortune'
import { getDateKey, getOrCreateDeviceId, resolveDailyFortune } from './utils/draw'
import { findRecordByDate, readHistory, saveDailyRecord } from './utils/storage'

const todayKey = ref(getDateKey())
const deviceId = ref('')
const currentFortune = ref<Fortune | null>(null)
const history = ref<DailyDrawRecord[]>([])
const isAnimating = ref(false)
const isSharing = ref(false)

const sigilRef = ref<HTMLElement | null>(null)
const lotDrumRef = ref<HTMLElement | null>(null)
const fortuneStickRef = ref<HTMLElement | null>(null)
const cardPanelRef = ref<HTMLElement | null>(null)
const shareCardRef = ref<HTMLElement | null>(null)

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-')
  return `${year}年${month}月${day}日`
}

const dateLabel = computed(() => formatDateLabel(todayKey.value))

const drawHint = computed(() =>
  currentFortune.value
    ? '今日命运已定，轻触签筒可重温仪式并保存签文。'
    : '轻触签筒，抽取今日命运之签。',
)

const recentRecords = computed(() => {
  const items: Array<{ dateKey: string; fortune: Fortune }> = []

  for (const record of history.value.slice(0, 5)) {
    const fortune = fortunes[record.fortuneId - 1]

    if (fortune) {
      items.push({
        dateKey: record.dateKey,
        fortune,
      })
    }
  }

  return items
})

function applySceneState(showResult: boolean): void {
  if (lotDrumRef.value) {
    gsap.set(lotDrumRef.value, { rotate: 0, y: 0, scale: 1 })
  }

  if (sigilRef.value) {
    gsap.set(sigilRef.value, { scale: 1, autoAlpha: 0.82 })
  }

  if (fortuneStickRef.value) {
    gsap.set(fortuneStickRef.value, {
      autoAlpha: showResult ? 1 : 0,
      y: showResult ? -132 : 30,
      rotate: showResult ? -7 : 0,
    })
  }

  if (cardPanelRef.value) {
    gsap.set(cardPanelRef.value, {
      autoAlpha: showResult ? 1 : 0,
      y: showResult ? 0 : 70,
      scale: showResult ? 1 : 0.95,
    })
  }
}

async function hydrateTodayRecord(): Promise<void> {
  deviceId.value = getOrCreateDeviceId()
  history.value = readHistory()

  const record = findRecordByDate(todayKey.value)
  if (!record) {
    await nextTick()
    applySceneState(false)
    return
  }

  currentFortune.value = fortunes[record.fortuneId - 1] ?? null
  await nextTick()
  applySceneState(Boolean(currentFortune.value))
}

async function runDrawAnimation(): Promise<void> {
  await nextTick()
  applySceneState(false)

  return new Promise((resolve) => {
    const timeline = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      onComplete: () => {
        isAnimating.value = false
        resolve()
      },
    })

    if (sigilRef.value) {
      timeline.to(sigilRef.value, { scale: 1.08, autoAlpha: 1, duration: 0.4 })
    }

    if (lotDrumRef.value) {
      timeline.to(
        lotDrumRef.value,
        {
          duration: 0.18,
          rotate: 10,
          y: -8,
          repeat: 7,
          yoyo: true,
        },
        0,
      )
    }

    if (fortuneStickRef.value) {
      timeline.to(
        fortuneStickRef.value,
        {
          autoAlpha: 1,
          y: -148,
          rotate: -8,
          duration: 0.7,
          ease: 'power3.out',
        },
        1.05,
      )
    }

    if (cardPanelRef.value) {
      timeline.to(
        cardPanelRef.value,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        1.35,
      )
    }

    if (sigilRef.value) {
      timeline.to(
        sigilRef.value,
        {
          scale: 1.18,
          duration: 0.6,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
        },
        1.1,
      )
    }
  })
}

async function drawTodayFortune(): Promise<void> {
  if (isAnimating.value || !deviceId.value) {
    return
  }

  isAnimating.value = true

  const fortune =
    currentFortune.value ?? (await resolveDailyFortune(todayKey.value, deviceId.value))

  if (!currentFortune.value) {
    currentFortune.value = fortune
    history.value = saveDailyRecord({
      dateKey: todayKey.value,
      fortuneId: fortune.id,
      drawnAt: new Date().toISOString(),
    })
  }

  await runDrawAnimation()
}

async function downloadShareCard(): Promise<void> {
  if (!shareCardRef.value || !currentFortune.value || isSharing.value) {
    return
  }

  isSharing.value = true

  try {
    const dataUrl = await toPng(shareCardRef.value, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#0a0e17',
    })

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `命运之签-${todayKey.value}.png`
    link.click()
  } finally {
    isSharing.value = false
  }
}

onMounted(async () => {
  await hydrateTodayRecord()
})
</script>

<template>
  <main class="relative isolate overflow-hidden">
    <div class="floating-particles absolute inset-0 -z-20" />
    <div class="absolute inset-x-0 top-0 -z-10 h-[44rem] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_32%)]" />

    <section class="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-5 md:px-6 md:py-6">
      <section
        class="temple-stage relative min-h-[840px] overflow-hidden rounded-[32px] border border-amber-200/10 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
      >
        <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.38))]" />
        <div class="temple-vignette absolute inset-0" />
        <div class="temple-wall absolute inset-0" />
        <div class="temple-halo absolute inset-x-0 top-[10%] mx-auto h-[34rem] w-[34rem] max-w-[80vw]" />
        <div class="temple-ring absolute left-1/2 top-[9%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full" />
        <div class="temple-floor absolute inset-x-0 bottom-0 h-[30%]" />
        <div class="stage-mist absolute inset-x-0 bottom-[20%] h-56" />

        <div class="lantern lantern-left absolute left-[2%] top-[12%] hidden lg:block">
          <div class="lantern-glow" />
          <div class="lantern-body" />
          <div class="lantern-tassel" />
        </div>
        <div class="lantern lantern-right absolute right-[2%] top-[12%] hidden lg:block">
          <div class="lantern-glow" />
          <div class="lantern-body" />
          <div class="lantern-tassel" />
        </div>

        <div class="relative z-10 flex min-h-[840px] flex-col px-5 py-5 md:px-8 md:py-7">
          <div class="flex items-start justify-between gap-4">
            <div class="rounded-[28px] border border-amber-200/15 bg-black/20 px-5 py-4 backdrop-blur-md">
              <p class="text-[11px] tracking-[0.35em] text-amber-200/45">今日运签</p>
              <p class="mt-2 max-w-xs text-xl leading-8 text-stone-100 md:text-[1.7rem]">
                让签自己落定，再看今天的气象。
              </p>
            </div>

            <div class="hidden rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-right text-xs text-stone-400 backdrop-blur-md md:block">
              <p class="tracking-[0.3em] text-amber-200/70">FATE DRAW</p>
              <p class="mt-2 text-sm text-stone-200">{{ dateLabel }}</p>
              <p class="mt-1">今日结果固定，本地留存</p>
            </div>
          </div>

          <div class="relative flex flex-1 items-center justify-center">
            <div class="absolute inset-x-0 bottom-[15%] mx-auto w-[76%] max-w-4xl">
              <div class="altar-runes mx-auto h-24 w-full max-w-3xl" />
            </div>

            <div class="relative flex h-[34rem] w-full items-end justify-center">
              <div
                class="sigil-ring pointer-events-none absolute bottom-[11rem] h-72 w-72 rounded-full border border-amber-200/10 bg-[radial-gradient(circle,rgba(212,175,55,0.14),transparent_55%)] blur-[1px]"
                ref="sigilRef"
              />
              <div class="absolute bottom-[6.2rem] h-12 w-[26rem] rounded-full bg-black/55 blur-2xl" />
              <div class="altar-base absolute bottom-0 h-28 w-[42rem] max-w-[88%]" />

              <div
                class="fortune-stick absolute bottom-[10.8rem] z-30 h-64 w-6 rounded-full border border-amber-100/10 bg-[linear-gradient(180deg,#d79a58_0%,#9c5b2d_46%,#643716_100%)]"
                ref="fortuneStickRef"
              />

              <button
                ref="lotDrumRef"
                class="lot-drum relative z-20 h-[15rem] w-[7.5rem] rounded-[18px] border border-amber-100/12 transition-transform duration-300 hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200 md:h-[16.5rem] md:w-[8.4rem]"
                type="button"
                :disabled="isAnimating"
                @click="drawTodayFortune"
                aria-label="抽取今日命运之签"
              >
                <span class="drum-rim drum-rim-top" />
                <span class="drum-rim drum-rim-bottom" />
                <span class="drum-cap" />
                <span class="drum-side-glow" />
                <span class="drum-carving" />
                <span class="drum-medallion drum-medallion-left" />
                <span class="drum-medallion drum-medallion-right" />
                <span class="drum-plaque">
                  <span>有</span>
                  <span>求</span>
                  <span>必</span>
                  <span>应</span>
                </span>
                <span class="drum-sticks">
                  <span
                    v-for="index in 12"
                    :key="index"
                    class="drum-stick"
                    :style="{
                      left: `${18 + index * 5.1}%`,
                      transform: `translateX(-50%) rotate(${(index - 6) * 2.1}deg)`,
                    }"
                  />
                </span>
              </button>
            </div>
          </div>

          <div class="relative z-10 flex justify-center">
            <div
              class="rounded-[30px] border border-[#5a2817] bg-[linear-gradient(180deg,rgba(34,8,5,0.92),rgba(24,7,4,0.95))] px-7 py-5 text-center shadow-[0_18px_60px_rgba(0,0,0,0.5)] md:min-w-[540px]"
            >
              <p class="font-display text-3xl tracking-[0.18em] text-[#f3ddaa] md:text-4xl">
                轻触签筒，摇出来今天的运势签
              </p>
              <p class="mt-2 text-sm text-[#b39b80]">{{ drawHint }}</p>
              <div class="mt-5 flex flex-col items-center justify-center gap-3 md:flex-row">
                <button
                  class="gold-button min-w-52 rounded-full px-7 py-3 text-sm font-semibold tracking-[0.28em] transition-transform duration-300 hover:-translate-y-0.5"
                  type="button"
                  :disabled="isAnimating"
                  @click="drawTodayFortune"
                >
                  {{ isAnimating ? '仪式进行中' : currentFortune ? '重温今日仪式' : '抽取今日之签' }}
                </button>

                <button
                  class="min-w-52 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold tracking-[0.18em] text-stone-100 transition hover:border-amber-200/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  :disabled="!currentFortune || isSharing"
                  @click="downloadShareCard"
                >
                  {{ isSharing ? '生成分享图中' : '保存签文卡片' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div
          ref="cardPanelRef"
          class="temple-panel rounded-[32px] border border-white/10 p-4 md:p-5"
        >
          <FortuneCard
            v-if="currentFortune"
            :fortune="currentFortune"
            :date-label="dateLabel"
          />
          <div
            v-else
            class="flex min-h-[26rem] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-8 text-center"
          >
            <p class="font-display text-3xl text-amber-100">神谕尚未显现</p>
            <p class="mt-4 max-w-md text-sm leading-7 text-stone-400">
              点击上方签筒后，将依次触发摇签、飞签与签文展开动画，并生成今日固定结果。
            </p>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="temple-panel rounded-[32px] border border-white/10 p-6">
            <div class="grid gap-3 text-sm text-stone-300 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="mb-1 text-xs tracking-[0.35em] text-amber-200/75">签文库</p>
                <p class="text-2xl font-semibold text-stone-100">108</p>
                <p class="text-xs text-stone-400">上中下签按比例分布</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="mb-1 text-xs tracking-[0.35em] text-amber-200/75">今日日期</p>
                <p class="text-lg font-semibold text-stone-100">{{ dateLabel }}</p>
                <p class="text-xs text-stone-400">每日零点后自动更新</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="mb-1 text-xs tracking-[0.35em] text-amber-200/75">本地记录</p>
                <p class="text-2xl font-semibold text-stone-100">{{ history.length }}</p>
                <p class="text-xs text-stone-400">保留最近 30 次抽签</p>
              </div>
            </div>
          </div>

          <aside class="temple-panel rounded-[32px] border border-white/10 p-6">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-amber-200/80">Local Archive</p>
                <h3 class="font-display mt-2 text-2xl text-stone-100">最近抽签记录</h3>
              </div>
              <span class="text-xs text-stone-500">本地保存</span>
            </div>

            <div v-if="recentRecords.length" class="space-y-3">
              <div
                v-for="record in recentRecords"
                :key="record.dateKey"
                class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p class="text-sm font-medium text-stone-100">{{ formatDateLabel(record.dateKey) }}</p>
                  <p class="mt-1 text-xs tracking-[0.25em] text-stone-500">{{ record.fortune.signNumber }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-amber-100">{{ record.fortune.aura }}</p>
                  <p class="mt-1 text-xs text-stone-400">{{ record.fortune.tier }}</p>
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-stone-400"
            >
              你还没有抽过签，今日第一签会自动写入本地记录。
            </div>
          </aside>
        </aside>
      </section>
    </section>

    <div class="pointer-events-none fixed -left-[9999px] top-0">
      <div ref="shareCardRef">
        <FortuneCard
          v-if="currentFortune"
          :fortune="currentFortune"
          :date-label="dateLabel"
          share-mode
        />
      </div>
    </div>
  </main>
</template>
