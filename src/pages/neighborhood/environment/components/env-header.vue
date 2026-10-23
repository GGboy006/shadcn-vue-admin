<script setup lang="ts">
import { toast } from 'vue-sonner'

import type { VillageStat, VillageStatSave } from '@/services/api/neighborhood-governance.api'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetStatListQuery, useUpdateStatMutation } from '@/services/api/neighborhood-governance.api'
import { useGetEnvNewsListQuery } from '@/services/api/neighborhood-resident.api'

const codes = [
  { code: 'garbage_rate', fallback: '垃圾分类覆盖率' },
  { code: 'beautiful_yard', fallback: '美丽庭院' },
  { code: 'illegal_build', fallback: '本月违建' },
] as const

const { data: statData, isLoading } = useGetStatListQuery()
const { data: newsData } = useGetEnvNewsListQuery()
const drafts = reactive<Record<string, string>>({})

const stats = computed(() => {
  const source = statData.value?.data
  const list = Array.isArray(source) ? source : []
  return codes.map(item => ({ ...item, row: list.find(stat => stat.statCode === item.code) }))
})

watch(statData, () => {
  for (const item of stats.value)
    drafts[item.code] = item.row?.statValue ?? ''
}, { immediate: true })

const published = computed(() => {
  const source = newsData.value?.data
  const list = Array.isArray(source) ? source : []
  return list.filter(item => item.status === 1).length
})

const { mutate, isPending } = useUpdateStatMutation()

function save(row: VillageStat, value: string) {
  const payload: VillageStatSave = {
    statId: row.statId,
    statName: row.statName,
    statValue: value.trim(),
    unit: row.unit ?? undefined,
    icon: row.icon ?? undefined,
    status: row.status,
    sortOrder: row.sortOrder,
  }
  mutate(payload, {
    onSuccess: () => toast.success(`已保存${row.statName}`),
    onError: (err: Error) => toast.error(err.message || '保存失败'),
  })
}
</script>

<template>
  <div class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <template v-if="isLoading">
      <Skeleton v-for="item in 4" :key="item" class="h-24" />
    </template>
    <template v-else>
      <div v-for="item in stats" :key="item.code" class="rounded-lg border bg-card px-4 py-3">
        <div class="text-sm text-muted-foreground">
          {{ item.row?.statName || item.fallback }}
        </div>
        <template v-if="item.row">
          <p v-if="item.row.status !== 1" class="mt-1 text-xs text-destructive">
            已禁用，居民端不显示。
          </p>
          <Input v-model="drafts[item.code]" class="mt-2" />
          <Button class="mt-2" size="sm" variant="outline" :disabled="isPending" @click="save(item.row, drafts[item.code] ?? '')">
            保存
          </Button>
        </template>
        <p v-else class="mt-2 text-sm text-muted-foreground">
          村情里还没有这项指标，请先在村情数据里建好。
        </p>
      </div>
      <div class="rounded-lg border bg-card px-4 py-3">
        <div class="text-sm text-muted-foreground">
          已发布整治动态
        </div>
        <div class="mt-1 text-2xl font-semibold tabular-nums">
          {{ published }}
        </div>
        <p class="mt-2 text-xs text-muted-foreground">
          按已发布的动态条数统计，不用另存。
        </p>
      </div>
    </template>
  </div>
</template>
