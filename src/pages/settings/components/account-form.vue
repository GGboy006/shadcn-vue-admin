<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { CalendarDaysIcon, CheckIcon, ChevronsUpDownIcon } from '@lucide/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { toDate } from 'reka-ui/date'
import { toast } from 'vue-sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { accountValidator } from '../validators/account.validator'

const open = ref(false)
const dateValue = ref()
const placeholder = ref()

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const df = new DateFormatter('en-US', {
  dateStyle: 'long',
})

const accountFormSchema = toTypedSchema(accountValidator)

// https://github.com/logaretm/vee-validate/issues/3521
// https://github.com/logaretm/vee-validate/discussions/3571
async function onSubmit(values: any) {
  toast('提交的数据如下：', {
    description: h('pre', { class: 'mt-2 w-[340px] rounded-md bg-slate-950 p-4' }, h('code', { class: 'text-white' }, JSON.stringify(values, null, 2))),
  })
}
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      账户
    </h3>
    <p class="text-sm text-muted-foreground">
      更新账户设置，设置首选语言和时区。
    </p>
  </div>
  <Separator class="my-4" />
  <Form v-slot="{ setFieldValue }" :validation-schema="accountFormSchema" class="space-y-8" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>姓名</FormLabel>
        <FormControl>
          <Input type="text" placeholder="您的姓名" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          这是将显示在您的个人资料和邮件中的名称。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ field, value }" name="dob">
      <FormItem class="flex flex-col">
        <FormLabel>出生日期</FormLabel>
        <Popover>
          <PopoverTrigger as-child>
            <FormControl>
              <Button
                variant="outline" :class="cn(
                  'w-[240px] justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                )"
              >
                <CalendarDaysIcon class="size-4 opacity-50" />
                <span>{{ value ? df.format(toDate(dateValue, getLocalTimeZone())) : "选择日期" }}</span>
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              v-model:placeholder="placeholder"
              v-model="dateValue"
              calendar-label="出生日期"
              initial-focus
              :min-value="new CalendarDate(1900, 1, 1)"
              :max-value="today(getLocalTimeZone())"
              @update:model-value="(v) => {
                if (v) {
                  dateValue = v
                  setFieldValue('dob', toDate(v).toISOString())
                }
                else {
                  dateValue = undefined
                  setFieldValue('dob', undefined)
                }
              }"
            />
          </PopoverContent>
        </Popover>
        <FormDescription>
          您的出生日期用于计算年龄。
        </FormDescription>
        <FormMessage />
      </FormItem>
      <input type="hidden" v-bind="field">
    </FormField>

    <FormField v-slot="{ value }" name="language">
      <FormItem class="flex flex-col">
        <FormLabel>语言</FormLabel>

        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <FormControl>
              <Button
                variant="outline" role="combobox" :aria-expanded="open" :class="cn(
                  'w-[200px] justify-between',
                  !value && 'text-muted-foreground',
                )"
              >
                {{ value ? languages.find(
                  (language) => language.value === value,
                )?.label : '选择语言...' }}

                <ChevronsUpDownIcon class="size-4 ml-2 opacity-50 shrink-0" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent class="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="搜索语言..." />
              <CommandEmpty>未找到语言。</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  <CommandItem
                    v-for="language in languages" :key="language.value" :value="language.label"
                    @select="() => {
                      setFieldValue('language', language.value)
                      open = false
                    }"
                  >
                    <CheckIcon
                      :class="cn(
                        'mr-2 h-4 w-4',
                        value === language.value ? 'opacity-100' : 'opacity-0',
                      )"
                    />
                    {{ language.label }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <FormDescription>
          这是将在仪表盘中使用的语言。
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex justify-start">
      <Button type="submit">
        更新账户
      </Button>
    </div>
  </Form>
</template>
