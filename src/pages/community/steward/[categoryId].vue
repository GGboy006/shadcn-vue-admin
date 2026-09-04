<route lang="yaml">
meta:
  roles: [3]
</route>

<script setup lang="ts">
/** 旧深链兼容：/community/steward/:categoryId → 主页面 + 分配 Sheet */
const route = useRoute()
const router = useRouter()

onMounted(() => {
  const categoryId = (route.params as Record<string, string>).categoryId
  router.replace({
    path: '/community/steward',
    query: {
      tab: 'category',
      assign: categoryId,
    },
  })
})
</script>

<template>
  <div />
</template>
