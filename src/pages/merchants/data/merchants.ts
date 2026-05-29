import { faker } from '@faker-js/faker'

// 模拟商户/物业数据
export const merchants = Array.from({ length: 20 }, () => {
  const type = faker.helpers.arrayElement([1, 2])
  return {
    id: faker.string.uuid(),
    merchantName: type === 1 ? faker.company.name() : `${faker.location.street()}物业`,
    type,
    contactPhone: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([1, 2]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
