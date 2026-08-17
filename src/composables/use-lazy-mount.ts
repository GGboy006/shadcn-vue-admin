import type { Ref } from 'vue'

/**
 * 弹层懒挂载:首次 open 变为 true 才渲染,此后保持挂载(即使 open 变回 false)。
 *
 * 用于替代「v-if 直接绑定 open 状态」的写法——那种写法虽然避免了列表按行常驻挂载
 * 导致的预拉详情问题,但 open 变 false 时 v-if 会立刻把组件从 DOM 移除,导致
 * Dialog/Sheet/Drawer 自身的关闭动画(依赖 data-state=closed 的 CSS transition)
 * 来不及播放就被打断。改用本 composable 后:首次打开前不挂载(不发详情请求),
 * 打开后常驻(关闭动画正常播放),后续开关只切换 open,不再重新挂载/卸载。
 */
export function useLazyMount(open: Ref<boolean>) {
  const rendered = ref(open.value)

  watch(open, (value) => {
    if (value)
      rendered.value = true
  })

  return rendered
}
