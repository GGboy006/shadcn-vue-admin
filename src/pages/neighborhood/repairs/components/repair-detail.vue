<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import { useGetRepairDetailQuery } from '@/services/api/neighborhood-resident.api'

const props = defineProps<{ repairId: string }>()

const { data, isLoading } = useGetRepairDetailQuery(() => props.repairId)
const detail = computed(() => data.value?.data)
const logs = computed(() => detail.value?.logs ?? [])

function text(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '')
    return '-'
  return String(value)
}
</script>

<template>
  <div v-if="isLoading" class="space-y-3">
    <Skeleton class="h-8 w-40" />
    <Skeleton class="h-32 w-full" />
  </div>
  <div v-else-if="detail" class="space-y-6">
    <dl class="grid gap-3 text-sm sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">
          单号
        </dt>
        <dd>{{ text(detail.code) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          类型
        </dt>
        <dd>{{ text(detail.typeLabel) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          标题
        </dt>
        <dd>{{ text(detail.name) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          状态
        </dt>
        <dd>{{ text(detail.statusLabel) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          报修人
        </dt>
        <dd>{{ text(detail.userName) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          电话
        </dt>
        <dd>{{ text(detail.userPhone) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          地点
        </dt>
        <dd>{{ text(detail.address) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          联系人
        </dt>
        <dd>{{ text(detail.contactName) }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          上报时间
        </dt>
        <dd>{{ text(detail.createTime) }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          问题描述
        </dt>
        <dd class="whitespace-pre-wrap">
          {{ text(detail.content) }}
        </dd>
      </div>
    </dl>
    <img v-if="detail.poster" :src="detail.poster" alt="现场照片" class="max-h-48 rounded-md object-cover">

    <section class="space-y-3">
      <h3 class="text-sm font-medium">
        处理进度
      </h3>
      <p v-if="!logs.length" class="text-sm text-muted-foreground">
        还没有进度
      </p>
      <ul v-else class="space-y-3">
        <li v-for="log in logs" :key="log.logId" class="border-l-2 pl-3">
          <div class="text-xs text-muted-foreground">
            {{ log.createTime }} · {{ log.statusLabel }}
          </div>
          <div class="whitespace-pre-wrap text-sm">
            {{ log.content }}
          </div>
        </li>
      </ul>
    </section>
  </div>
  <p v-else class="text-sm text-muted-foreground">
    没有读到这条报修
  </p>
</template>
