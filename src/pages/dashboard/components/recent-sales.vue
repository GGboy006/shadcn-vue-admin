<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  avatar: string
  name: string
  email: string
  amount: string
}

const list = ref<User[]>([
  { avatar: '', name: '奥利维亚·马丁', email: 'olivia.martin@email.com', amount: '$1,999.00' },
  { avatar: '', name: '杰克逊·李', email: 'jackson.lee@email.com', amount: '$39.00' },
  { avatar: '', name: '伊莎贝拉·阮', email: 'isabella.nguyen@email.com', amount: '$299.00' },
  { avatar: '', name: '威廉·金', email: 'will@email.com', amount: '$99.00' },
  { avatar: '', name: '索菲亚·戴维斯', email: 'sofia.davis@email.com', amount: '$39.00' },
])
</script>

<template>
  <div class="space-y-8">
    <div v-for="item in list" :key="item.name" class="flex items-center gap-4">
      <Avatar class-name="h-9 w-9">
        <AvatarImage :src="item.avatar" alt="头像" />
        <AvatarFallback>{{ item.name[0].toUpperCase() }}</AvatarFallback>
      </Avatar>
      <div class="flex flex-wrap items-center justify-between flex-1">
        <div class="space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ item.name }}
          </p>
          <p class="text-sm text-muted-foreground">
            {{ item.email }}
          </p>
        </div>
        <div class="font-medium">
          {{ item.amount }}
        </div>
      </div>
    </div>
  </div>
</template>
