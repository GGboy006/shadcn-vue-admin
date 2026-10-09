import { useGetHousekeeperServicePageQuery } from '@/services/api/housekeeper.api'

/** 管家登录后分页只会返回本馆一条 */
export function useOwnHousekeeperService() {
  const query = ref({
    pageNum: 1,
    pageSize: 1,
  })
  const result = useGetHousekeeperServicePageQuery(query)
  const service = computed(() => result.data.value?.data?.list?.[0])
  const housekeeperId = computed(() => service.value?.housekeeperId)

  return {
    service,
    housekeeperId,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
  }
}
