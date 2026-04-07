import { PrismaClient, AdminRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@foodfinder.app' },
    update: {},
    create: {
      email: 'admin@foodfinder.app',
      password: adminPassword,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  })

  const foodCourt = await prisma.foodCourt.upsert({
    where: { slug: 'downtown-food-court' },
    update: {},
    create: {
      name: 'Downtown Food Court',
      slug: 'downtown-food-court',
      address: '123 Main Street, Downtown',
      isActive: true,
    },
  })

  const merchantPassword = await bcrypt.hash('merchant123', 10)
  const merchant = await prisma.merchant.upsert({
    where: { email: 'pizza@foodfinder.app' },
    update: {},
    create: {
      email: 'pizza@foodfinder.app',
      password: merchantPassword,
      storeName: 'Pizza Palace',
      ownerName: 'John Doe',
      phone: '+1234567890',
      description: 'Best pizza in town!',
      isActive: true,
      isApproved: true,
      foodCourtId: foodCourt.id,
    },
  })

  const category = await prisma.category.create({
    data: {
      name: 'Pizza',
      merchantId: merchant.id,
    },
  })

  const items = [
    { name: 'Margherita Pizza', price: 12.99, description: 'Classic tomato and mozzarella', prepTime: 15 },
    { name: 'Pepperoni Pizza', price: 14.99, description: 'Pepperoni with mozzarella', prepTime: 15 },
    { name: 'BBQ Chicken Pizza', price: 15.99, description: 'BBQ sauce with grilled chicken', prepTime: 18 },
    { name: 'Garlic Bread', price: 5.99, description: 'Freshly baked garlic bread', prepTime: 8 },
  ]

  for (const item of items) {
    await prisma.menuItem.create({
      data: {
        ...item,
        categoryId: category.id,
        merchantId: merchant.id,
      },
    })
  }

  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { foodCourtId_number: { foodCourtId: foodCourt.id, number: i } },
      update: {},
      create: {
        number: i,
        foodCourtId: foodCourt.id,
      },
    })
  }

  console.log('Seed data created successfully')
  console.log('Admin:', admin.email)
  console.log('Merchant:', merchant.email)
  console.log('Food Court:', foodCourt.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
