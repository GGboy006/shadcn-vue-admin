<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

import type { ApplyValidator } from '@/pages/marketing/validators/apply.validator'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { APPLY_IDENTITY_OPTIONS, applyValidator } from '@/pages/marketing/validators/apply.validator'
import { buildStationApplyAddDTO, useCreateStationApplyMutation } from '@/services/api/station-apply.api'
import { showInvalidSubmitToast } from '@/validators/common'

const submitted = ref(false)
const { mutate, isPending } = useCreateStationApplyMutation()

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(applyValidator),
  initialValues: {
    communityName: '',
    contactName: '',
    phone: '',
    identity: undefined,
    remark: '',
  },
})

const onSubmit = handleSubmit((values) => {
  mutate(buildStationApplyAddDTO(values as ApplyValidator), {
    onSuccess: () => {
      submitted.value = true
      toast.success('申请已提交，实施同学会尽快联系你')
    },
  })
}, showInvalidSubmitToast)

function fillAgain() {
  submitted.value = false
  resetForm()
}
</script>

<template>
  <UiCard class="p-6 mt-8 max-w-xl mx-auto">
    <template v-if="submitted">
      <h3 class="text-xl font-semibold">
        {{ $t('marketing.applyForm.successTitle') }}
      </h3>
      <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
        {{ $t('marketing.applyForm.successHint') }}
      </p>
      <Button class="mt-6" variant="outline" type="button" @click="fillAgain">
        {{ $t('marketing.applyForm.again') }}
      </Button>
    </template>

    <form v-else class="space-y-5" @submit="onSubmit">
      <div>
        <h3 class="text-xl font-semibold">
          {{ $t('marketing.applyForm.title') }}
        </h3>
        <p class="text-sm text-muted-foreground mt-1">
          {{ $t('marketing.applyForm.subtitle') }}
        </p>
      </div>

      <FormField v-slot="{ componentField }" name="communityName">
        <FormItem>
          <FormLabel required>
            {{ $t('marketing.applyForm.communityName') }}
          </FormLabel>
          <FormControl>
            <Input type="text" :placeholder="$t('marketing.applyForm.communityNamePlaceholder')" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="contactName">
        <FormItem>
          <FormLabel required>
            {{ $t('marketing.applyForm.contactName') }}
          </FormLabel>
          <FormControl>
            <Input type="text" :placeholder="$t('marketing.applyForm.contactNamePlaceholder')" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="phone">
        <FormItem>
          <FormLabel required>
            {{ $t('marketing.applyForm.phone') }}
          </FormLabel>
          <FormControl>
            <Input type="tel" maxlength="11" :placeholder="$t('marketing.applyForm.phonePlaceholder')" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="identity">
        <FormItem>
          <FormLabel required>
            {{ $t('marketing.applyForm.identity') }}
          </FormLabel>
          <Select v-bind="componentField">
            <FormControl>
              <SelectTrigger class="w-full">
                <SelectValue :placeholder="$t('marketing.applyForm.identityPlaceholder')" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem v-for="item in APPLY_IDENTITY_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="remark">
        <FormItem>
          <FormLabel>{{ $t('marketing.applyForm.remark') }}</FormLabel>
          <FormControl>
            <Textarea rows="3" :placeholder="$t('marketing.applyForm.remarkPlaceholder')" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" class="w-full" :disabled="isPending">
        <UiSpinner v-if="isPending" class="mr-2 size-4" />
        {{ $t('marketing.applyForm.submit') }}
      </Button>
    </form>
  </UiCard>
</template>
