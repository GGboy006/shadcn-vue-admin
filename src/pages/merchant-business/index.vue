<route lang="yaml">
meta:
  roles: [3, 4]
</route>

<script setup lang="ts">
// 重定向页:商户后台默认入口 -> 商户概览(首个菜单)。
//
// 用脚本式 redirect 而非 <route> 块的 redirect 字段:
// vue-router 5 文件路由对该字段在 index.vue 上支持不可靠(见 errors/index.vue 同款写法)。
// overview 对站长代客 / 商户开放,作为统一首页。物业不进本后台。
const router = useRouter()
router.replace({ name: '/merchant-business/overview/' })
</script>

<template>
  <div />
</template>
