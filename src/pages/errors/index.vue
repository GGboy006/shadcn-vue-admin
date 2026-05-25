<script lang="ts" setup>
const router = useRouter()
// 重定向到 404 错误页面
router.replace({ name: '/errors/404' })
</script>
