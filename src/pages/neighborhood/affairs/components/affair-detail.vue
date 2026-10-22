<script setup lang="ts">
import { RichTextContent } from '@/components/prop-ui/rich-text'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetAffairDetailQuery } from '@/services/api/neighborhood-resident.api'

const props = defineProps<{ affairId: string }>()
const { data, isLoading } = useGetAffairDetailQuery(() => props.affairId)
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
  <div v-else-if="detail" class="space-y-4 text-sm">
    <dl class="grid gap-3 sm:grid-cols-2">
      <div>
        <dt class="text-muted-foreground">
          标题
        </dt>
        <dd>{{ text(detail.name) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          类型
        </dt>
        <dd>{{ text(detail.typeLabel) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          状态
        </dt>
        <dd>{{ text(detail.statusLabel) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          发起人
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
          截止时间
        </dt>
        <dd>{{ text(detail.endTime) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          支持
        </dt>
        <dd>{{ text(detail.supportCount) }}</dd>
      </div>
      <div>
        <dt class="text-muted-foreground">
          评论
        </dt>
        <dd>{{ text(detail.commentCount) }}</dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          描述
        </dt>
        <dd>
          <RichTextContent v-if="detail.content" :content="detail.content" />
          <template v-else>
            -
          </template>
        </dd>
      </div>
      <div class="sm:col-span-2">
        <dt class="text-muted-foreground">
          办理意见
        </dt>
        <dd class="whitespace-pre-wrap">
          {{ text(detail.replyContent) }}
        </dd>
      </div>
    </dl>
    <section class="space-y-2">
      <h3 class="font-medium">
        投票选项
      </h3>
      <p v-if="!detail.options?.length" class="text-muted-foreground">
        还没有选项
      </p>
      <ul v-else class="space-y-1">
        <li v-for="(item, index) in detail.options" :key="`${item.name}-${index}`" class="flex justify-between gap-3">
          <span>{{ item.name }}</span>
          <span class="tabular-nums text-muted-foreground">{{ item.votes }} 票</span>
        </li>
      </ul>
    </section>
  </div>
  <p v-else class="text-sm text-muted-foreground">
    没有读到这条议题
  </p>
</template>
