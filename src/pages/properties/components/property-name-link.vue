<script setup lang="ts">
import { ExternalLinkIcon } from '@lucide/vue'

import type { Merchant } from '../../merchants/data/schema'

import { resolveExternalUrl } from '../utils/external-url'

const props = defineProps<{
  property: Merchant
}>()

/** 物业是外部产品,点名称直接跳外链,不走商户代客后台 */
const href = computed(() => resolveExternalUrl(props.property.externalUrl))
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    class="inline-flex items-center gap-1 text-left font-medium text-primary hover:underline"
    :title="`在新标签页打开「${property.merchantName}」外部链接`"
  >
    {{ property.merchantName }}
    <ExternalLinkIcon class="size-3.5 shrink-0" />
  </a>

  <!-- 未配置外链时不给可点样式,避免用户点了没反应 -->
  <UiTooltip v-else>
    <UiTooltipTrigger as-child>
      <span class="cursor-help font-medium text-muted-foreground underline decoration-dotted">
        {{ property.merchantName }}
      </span>
    </UiTooltipTrigger>
    <UiTooltipContent>
      未配置外部链接,请先编辑物业补充
    </UiTooltipContent>
  </UiTooltip>
</template>
