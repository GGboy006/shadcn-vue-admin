<script lang="ts" setup>
import { BASE_URL } from '@/constants/app-config'
</script>

<template>
  <UiButton as="a" :href="`${BASE_URL}auth/sign-in`">
    {{ $t('login') }}
  </UiButton>
</template>
