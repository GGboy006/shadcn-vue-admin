<script setup lang="ts">
import Ripple from '@/components/inspira-ui/ripple/index.vue'
import SignInButton from '@/components/sign-in-button.vue'
</script>

<template>
  <div
    class="relative flex h-[450px] w-full flex-col items-center justify-center overflow-hidden rounded-lg"
  >
    <p class="z-10 text-center text-4xl lg:text-5xl font-medium tracking-tight text-balance px-4">
      {{ $t('marketing.setup.title') }}
    </p>
    <p class="mt-3 z-10 text-center text-muted-foreground px-4">
      {{ $t('marketing.setup.subtitle') }}
    </p>

    <div class="flex items-center gap-3 my-6 z-10">
      <SignInButton />
      <UiButton variant="outline" as-child>
        <a href="#access">{{ $t('marketing.apply') }}</a>
      </UiButton>
    </div>

    <Ripple
      class="bg-white/5 mask-[linear-gradient(to_bottom,white,transparent)]"
      circle-class="border-[hsl(var(--primary))] bg-primary/25 blobed"
    />
  </div>
</template>

<style scoped>
:deep(.blobed) {
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}
</style>
