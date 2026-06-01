# 项目组件文档

> 本文档汇总了 `src/components` 下的所有组件，方便快速查询和引入。

---

## 目录

- [一、shadcn-vue 基础组件（ui）](#一shadcn-vue-基础组件ui)
- [二、自定义业务组件（prop-ui）](#二自定义业务组件prop-ui)
- [三、项目级组件](#三项目级组件)
- [四、动效组件（inspira-ui）](#四动效组件inspira-ui)

---

## 一、shadcn-vue 基础组件（ui）

位于 `src/components/ui/*`，共 57 个组件目录，是 shadcn-vue 官方组件集。

### 引入方式

```ts
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
```

### 按场景分类

#### 表单类（最常用）

| 组件 | 导出项 | 用途 |
|------|--------|------|
| `button` | `Button` | 按钮 |
| `input` | `Input` | 文本输入框 |
| `textarea` | `Textarea` | 多行文本域 |
| `select` | `Select`, `SelectTrigger`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectValue` | 下拉选择 |
| `checkbox` | `Checkbox` | 复选框 |
| `switch` | `Switch` | 开关 |
| `radio-group` | `RadioGroup`, `RadioGroupItem` | 单选组 |
| `form` | `FormControl`, `FormDescription`, `FormItem`, `FormLabel`, `FormMessage` | 表单校验（配合 vee-validate） |
| `calendar` | `Calendar`, `CalendarCell`, `CalendarCellTrigger`, `CalendarGrid`, `CalendarGridBody`, `CalendarGridHead`, `CalendarGridRow`, `CalendarHeadCell`, `CalendarHeader`, `CalendarHeading`, `CalendarNextButton`, `CalendarPrevButton` | 日历 |
| `range-calendar` | `RangeCalendar`, `RangeCalendarCell`, `RangeCalendarCellTrigger`, ... | 范围日历 |
| `number-field` | `NumberField`, `NumberFieldContent`, `NumberFieldDecrement`, `NumberFieldIncrement`, `NumberFieldInput` | 数字输入 |
| `pin-input` | `PinInput`, `PinInputGroup`, `PinInputSeparator`, `PinInputSlot` | 验证码输入 |
| `input-otp` | `InputOTP`, `InputOTPGroup`, `InputOTPSeparator`, `InputOTPSlot` | OTP 输入 |
| `tags-input` | `TagsInput`, `TagsInputInput`, `TagsInputItem`, `TagsInputItemDelete`, `TagsInputItemText` | 标签输入 |
| `native-select` | `NativeSelect`, `NativeSelectOptGroup`, `NativeSelectOption` | 原生 select |
| `slider` | `Slider` | 滑块 |

#### 反馈 / 展示类（常用）

| 组件 | 导出项 | 用途 |
|------|--------|------|
| `dialog` | `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogScrollContent`, `DialogTitle`, `DialogTrigger` | 弹窗对话框 |
| `popover` | `Popover`, `PopoverAnchor`, `PopoverContent`, `PopoverTrigger` | 气泡卡片 |
| `dropdown-menu` | `DropdownMenu`, `DropdownMenuCheckboxItem`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger`, `DropdownMenuTrigger` | 下拉菜单 |
| `tooltip` | `Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger` | 文字提示 |
| `badge` | `Badge` | 徽章标签 |
| `avatar` | `Avatar`, `AvatarFallback`, `AvatarImage` | 头像 |
| `skeleton` | `Skeleton` | 骨架屏 |
| `sonner` | `Toaster` | Toast 通知（需配合 `vue-sonner` 的 `toast()` 使用） |
| `alert` | `Alert`, `AlertDescription`, `AlertTitle` | 警告提示 |
| `alert-dialog` | `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogTrigger` | 确认弹窗 |
| `progress` | `Progress` | 进度条 |
| `spinner` | `Spinner` | 加载动画 |
| `empty` | `Empty`, `EmptyContent`, `EmptyDescription`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle` | 空状态 |
| `separator` | `Separator` | 分隔线 |
| `scroll-area` | `ScrollArea`, `ScrollBar` | 滚动区域 |
| `hover-card` | `HoverCard`, `HoverCardContent`, `HoverCardTrigger` | 悬停卡片 |

#### 导航 / 布局类（常用）

| 组件 | 导出项 | 用途 |
|------|--------|------|
| `tabs` | `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` | 标签页 |
| `table` | `Table`, `TableBody`, `TableCaption`, `TableCell`, `TableEmpty`, `TableFooter`, `TableHead`, `TableHeader`, `TableRow` | 表格 |
| `card` | `Card`, `CardAction`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle` | 卡片 |
| `sheet` | `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetHeader`, `SheetTitle`, `SheetTrigger` | 侧滑面板 |
| `sidebar` | `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarHeader`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger` | 侧边栏（完整版） |
| `breadcrumb` | `Breadcrumb`, `BreadcrumbEllipsis`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbList`, `BreadcrumbPage`, `BreadcrumbSeparator` | 面包屑 |
| `pagination` | `Pagination`, `PaginationContent`, `PaginationEllipsis`, `PaginationFirst`, `PaginationItem`, `PaginationLast`, `PaginationNext`, `PaginationPrevious` | 分页 |
| `navigation-menu` | `NavigationMenu`, `NavigationMenuContent`, `NavigationMenuIndicator`, `NavigationMenuItem`, `NavigationMenuLink`, `NavigationMenuList`, `NavigationMenuTrigger`, `NavigationMenuViewport` | 导航菜单 |
| `menubar` | `Menubar`, `MenubarCheckboxItem`, `MenubarContent`, `MenubarGroup`, `MenubarItem`, `MenubarLabel`, `MenubarMenu`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSeparator`, `MenubarShortcut`, `MenubarSub`, `MenubarSubContent`, `MenubarSubTrigger`, `MenubarTrigger` | 菜单栏 |

#### 不常用 / 特定场景

| 组件 | 用途 |
|------|------|
| `accordion` | 手风琴折叠面板 |
| `aspect-ratio` | 固定宽高比容器 |
| `button-group` | 按钮组 |
| `carousel` | 轮播图 |
| `chart` | 图表容器（配合 recharts） |
| `collapsible` | 可折叠面板 |
| `combobox` | 组合框（搜索+选择） |
| `command` | 命令面板（类似 Cmd+K） |
| `context-menu` | 右键菜单 |
| `drawer` | 底部抽屉 |
| `field` | 字段布局 |
| `input-group` | 输入框组合（带前缀/后缀） |
| `item` | 列表项布局 |
| `kbd` | 键盘按键样式 |
| `label` | 标签 |
| `resizable` | 可调整大小面板 |
| `stepper` | 步骤条 |
| `toggle` | 单个切换按钮 |
| `toggle-group` | 切换按钮组 |

---

## 二、自定义业务组件（prop-ui）

位于 `src/components/prop-ui/*`，项目中自行封装的业务组件。

### 引入方式

```ts
import { DatePicker } from '@/components/prop-ui/date-picker'
```

### 组件清单

| 目录 | 导出项 | 用途 | 示例 |
|------|--------|------|------|
| `copy` | `Copy` | 复制到剪贴板按钮 | `<Copy text="xxx" />` |
| `date-picker` | `DatePicker` | 日期选择器（Popover + Calendar 封装） | `<DatePicker v-model="date" placeholder="选择日期" />` |
| `inline-tip` | `InlineTip` | 行内提示条 | `<InlineTip>提示内容</InlineTip>` |
| `modal` | `Modal`, `ModalClose`, `ModalContent`, `ModalDescription`, `ModalFooter`, `ModalHeader`, `ModalTitle`, `ModalTrigger` | 轻量弹窗容器 | 比 Dialog 更简洁 |
| `status-badge` | `Status`, `StatusBadge` | 状态徽章 | `<StatusBadge status="1" />` |

---

## 三、项目级组件

位于 `src/components` 根目录下，与具体业务场景强相关，一般不跨项目复用。

### 1. app-sidebar

侧边栏导航组件，用于后台管理布局。

| 组件 | 说明 |
|------|------|
| `AppSidebar` (`index.vue`) | 侧边栏主入口 |
| `MenuButton` | 菜单按钮 |
| `NavFooter` | 底部导航 |
| `NavMain` | 主导航 |
| `NavTeam` | 团队切换 |
| `TeamSwitcher` | 团队选择器 |

### 2. data-table

数据表格封装，含筛选、分页、排序、批量操作。

| 组件 | 说明 |
|------|------|
| `DataTable` | 表格主组件 |
| `BulkActions` | 批量操作栏 |
| `ColumnHeader` | 表头（含排序） |
| `FacetedFilter` | 多选筛选 |
| `RadioCell` | 单选列 |
| `TableLoading` | 加载状态 |
| `TablePagination` | 分页组件 |
| `ViewOptions` | 列显隐控制 |

### 3. global-layout

全局页面布局。

| 组件 | 说明 |
|------|------|
| `BasicHeader` | 基础页头 |
| `BasicPage` | 基础页面容器 |
| `TwoCol` | 两栏布局 |
| `TwoColAside` | 两栏侧边 |

### 4. command-menu-panel

全局命令面板（Cmd+K 快捷键）。

| 组件 | 说明 |
|------|------|
| `CommandMenuPanel` (`index.vue`) | 命令面板主入口 |
| `CommandChangeTheme` | 切换主题命令 |
| `CommandItemHasIcon` | 带图标的命令项 |
| `CommandToPage` | 跳转页面命令 |

### 5. marketing / marketing-layout

官网/营销页面专用组件。

| 组件 | 说明 |
|------|------|
| `Hero` | 首屏大图 |
| `Features` | 特性展示 |
| `Logos` | Logo 墙 |
| `Evaluation` | 用户评价 |
| `Setup` | 快速开始 |
| `TheHeader` | 官网页头 |
| `TheFooter` | 官网页脚 |

---

## 四、动效组件（inspira-ui）

位于 `src/components/inspira-ui/*`，纯视觉效果组件，用于 landing page。

### 引入方式

```ts
import FlickeringGrid from '@/components/inspira-ui/flickering-grid.vue'
```

### 组件清单

| 组件 | 文件 | 效果 |
|------|------|------|
| `FlickeringGrid` | `flickering-grid.vue` | 闪烁网格背景 |
| `GlowingEffect` | `glowing-effect.vue` | 发光边框效果 |
| `Marquee` | `marquee/index.vue` | 跑马灯滚动 |
| `ReviewCard` | `marquee/review-card.vue` | 评价卡片（配合 Marquee） |
| `Ripple` | `ripple/index.vue` | 涟漪扩散动画 |
| `RippleCircle` | `ripple/circle.vue` | 涟漪圆圈 |
| `RippleContainer` | `ripple/container.vue` | 涟漪容器 |

---

## 快速查询

需要某个组件时，直接对 AI 说：

> "用 **Dialog** 做个确认弹窗"
> "表单里加个 **DatePicker** 日期选择"
> "表格加上 **DataTable** 的批量操作"
> " landing 页用 **FlickeringGrid** 做背景"

AI 会自动从正确路径引入。
