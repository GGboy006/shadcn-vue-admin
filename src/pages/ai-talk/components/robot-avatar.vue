<script lang="ts" setup>
import { withBase } from '@/utils/with-base'
</script>

<template>
  <UiAvatar>
    <UiAvatarImage :src="withBase('/robot.png')" alt="机器人" />
    <UiAvatarFallback>机器人</UiAvatarFallback>
  </UiAvatar>
</template>
