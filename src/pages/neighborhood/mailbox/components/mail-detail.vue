<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMailDetailQuery } from '@/services/api/neighborhood-resident.api'

const props = defineProps<{ mailId: string }>()
const { data, isLoading } = useGetMailDetailQuery(() => props.mailId)
const detail = computed(() => data.value?.data)

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
  <dl v-else-if="detail" class="grid gap-3 text-sm sm:grid-cols-2">
    <div>
      <dt class="text-muted-foreground">
        单号
      </dt>
      <dd>{{ text(detail.code) }}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">
        标题
      </dt>
      <dd>{{ text(detail.name) }}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">
        来信人
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
        公开
      </dt>
      <dd>{{ text(detail.showStatusLabel) }}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">
        状态
      </dt>
      <dd>{{ text(detail.statusLabel) }}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">
        来信时间
      </dt>
      <dd>{{ text(detail.createTime) }}</dd>
    </div>
    <div>
      <dt class="text-muted-foreground">
        回复时间
      </dt>
      <dd>{{ text(detail.replyTime) }}</dd>
    </div>
    <div class="sm:col-span-2">
      <dt class="text-muted-foreground">
        留言
      </dt>
      <dd class="whitespace-pre-wrap">
        {{ text(detail.content) }}
      </dd>
    </div>
    <div class="sm:col-span-2">
      <dt class="text-muted-foreground">
        回复
      </dt>
      <dd class="whitespace-pre-wrap">
        {{ text(detail.replyContent) }}
      </dd>
    </div>
  </dl>
  <p v-else class="text-sm text-muted-foreground">
    没有读到这封来信
  </p>
</template>
