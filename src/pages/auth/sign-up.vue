<script setup lang="ts">
import AuthTitle from './components/auth-title.vue'
import GitHubButton from './components/github-button.vue'
import GoogleButton from './components/google-button.vue'
import PrivacyPolicyButton from './components/privacy-policy-button.vue'
import TermsOfServiceButton from './components/terms-of-service-button.vue'
</script>

<template>
  <div class="flex items-center justify-center min-h-screen p-4 min-w-screen">
    <main class="flex flex-col gap-4">
      <AuthTitle />
      <UiCard class="max-w-sm mx-auto">
        <UiCardHeader>
          <UiCardTitle class="text-xl">
            注册
          </UiCardTitle>
          <UiCardDescription>
            输入邮箱和密码创建账户。
            已有账户？
            <UiButton
              variant="link" class="px-0 text-muted-foreground"
              @click="$router.push('/auth/sign-in')"
            >
              登录
            </UiButton>
          </UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <div class="grid gap-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="grid gap-2">
                <UiLabel for="first-name">
                  名字
                </UiLabel>
                <UiInput id="first-name" placeholder="Max" required />
              </div>
              <div class="grid gap-2">
                <UiLabel for="last-name">
                  姓氏
                </UiLabel>
                <UiInput id="last-name" placeholder="Robinson" required />
              </div>
            </div>
            <div class="grid gap-2">
              <UiLabel for="email">
                邮箱
              </UiLabel>
              <UiInput
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div class="grid gap-2">
              <UiLabel for="password">
                密码
              </UiLabel>
              <UiInput id="password" type="password" placeholder="******" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="password">
                确认密码
              </UiLabel>
              <UiInput id="password" type="password" placeholder="******" />
            </div>
            <UiButton type="submit" class="w-full">
              创建账户
            </UiButton>

            <UiSeparator label="或使用以下方式继续" />

            <div class="flex flex-col items-center justify-between gap-4">
              <GitHubButton />
              <GoogleButton />
            </div>

            <UiCardDescription>
              创建账户即表示您同意我们的
              <TermsOfServiceButton />
              和
              <PrivacyPolicyButton />
            </UiCardDescription>
          </div>
        </UiCardContent>
      </UiCard>
    </main>
  </div>
</template>
