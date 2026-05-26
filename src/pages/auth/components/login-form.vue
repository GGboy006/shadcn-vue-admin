<script lang="ts" setup>
import { useAuth } from '@/composables/use-auth'

import PrivacyPolicyButton from './privacy-policy-button.vue'
import TermsOfServiceButton from './terms-of-service-button.vue'

const { login, loading } = useAuth()

const phone = ref('')
const password = ref('')
</script>

<template>
  <UiCard class="w-full max-w-sm">
    <UiCardHeader>
      <UiCardTitle class="text-2xl">
        登录
      </UiCardTitle>
      <UiCardDescription>
        输入手机号和密码登录您的账户。
      </UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="grid gap-4">
      <div class="grid gap-2">
        <UiLabel for="phone">
          手机号
        </UiLabel>
        <UiInput id="phone" v-model="phone" type="tel" placeholder="请输入手机号" required />
      </div>
      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <UiLabel for="password">
            密码
          </UiLabel>
          <!-- 暂时没有忘记密码的逻辑 -->
          <!-- <ToForgotPasswordLink /> -->
        </div>
        <UiInput id="password" v-model="password" type="password" required placeholder="请输入密码" />
      </div>

      <UiButton class="w-full" :disabled="loading" @click="login(phone, password)">
        <UiSpinner v-if="loading" class="mr-2" />
        {{ $t('login') }}
      </UiButton>

      <!-- 现在还没有快捷登录 -->

      <!-- <UiSeparator label="或使用以下方式登录" /> -->

      <!-- <div class="flex flex-col items-center justify-between gap-4">
        <GitHubButton />
        <GoogleButton />
      </div> -->

      <UiCardDescription>
        点击登录即表示您同意我们的
        <TermsOfServiceButton />
        和
        <PrivacyPolicyButton />
      </UiCardDescription>
    </UiCardContent>
  </UiCard>
</template>
