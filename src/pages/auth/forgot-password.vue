<script setup lang="ts">
import AuthTitle from './components/auth-title.vue'
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 min-w-screen">
    <main class="flex flex-col gap-4">
      <AuthTitle />
      <UiCard>
        <UiCardHeader>
          <UiCardTitle class="text-2xl">
            忘记密码
          </UiCardTitle>
          <UiCardDescription>
            请输入您注册的邮箱，我们将发送重置密码的链接给您。
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent class="grid gap-4">
          <div class="grid gap-2">
            <UiLabel for="email">
              {{ $t('email') }}
            </UiLabel>
            <UiInput id="email" type="email" placeholder="m@example.com" required />
          </div>
        </UiCardContent>
        <UiCardFooter class="flex flex-col gap-2">
          <UiButton class="w-full">
            {{ $t('forgotPasswordPage.continue') }}
          </UiButton>

          <div>
            还没有账户？
            <UiButton
              variant="link" class="px-0 text-muted-foreground"
              @click="$router.push('/auth/sign-up')"
            >
              立即注册
            </UiButton>
          </div>
        </UiCardFooter>
      </UiCard>
    </main>
  </div>
</template>
