import { createSharedComposable, useMediaQuery } from '@vueuse/core'

import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const useSharedFormSheet = createSharedComposable(() => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  // 桌面端 = Sheet(右侧抽屉),移动端 = Drawer(底部抽屉,带拖拽关闭)
  const FormSheet = computed(() => ({
    Root: isDesktop.value ? Sheet : Drawer,
    Content: isDesktop.value ? SheetContent : DrawerContent,
    Header: isDesktop.value ? SheetHeader : DrawerHeader,
    Title: isDesktop.value ? SheetTitle : DrawerTitle,
    Description: isDesktop.value ? SheetDescription : DrawerDescription,
    Footer: isDesktop.value ? SheetFooter : DrawerFooter,
    Close: isDesktop.value ? SheetClose : DrawerClose,
  }))

  // 桌面端传 side="right";移动端 Drawer 默认 bottom(vaul 原生方向,拖拽体验最佳)
  const contentProps = computed(() =>
    isDesktop.value ? { side: 'right' as const } : {},
  )

  // 桌面端沿用居委会样板宽度;移动端不施加(用 Drawer 默认)
  const contentClass = computed(() =>
    isDesktop.value ? 'flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl' : '',
  )

  return {
    isDesktop,
    FormSheet,
    contentProps,
    contentClass,
  }
})

export function useFormSheet() {
  return useSharedFormSheet()
}
