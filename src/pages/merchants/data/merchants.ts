import { faker } from '@faker-js/faker'

// 模拟商户/物业数据
export const merchants = Array.from({ length: 20 }, () => {
  const type = faker.helpers.arrayElement([4, 5, 6])
  return {
    id: faker.string.uuid(),
    merchantName: type === 4 ? faker.company.name() : type === 5 ? `${faker.location.street()}物业` : `${faker.location.street()}居委会`,
    type,
    contactPhone: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([1, 2]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
