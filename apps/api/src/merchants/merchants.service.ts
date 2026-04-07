import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class MerchantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const where: any = {}
    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: { foodCourt: { select: { name: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count({ where }),
    ])

    return {
      data: data.map(({ password, ...rest }) => rest),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        foodCourt: true,
        categories: { include: { menuItems: true } },
      },
    })
    if (!merchant) throw new NotFoundException('Merchant not found')
    const { password, ...result } = merchant
    return result
  }

  async approve(id: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { isApproved: true, isActive: true },
    })
  }

  async reject(id: string) {
    return this.prisma.merchant.update({
      where: { id },
      data: { isApproved: false, isActive: false },
    })
  }

  async toggleActive(id: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id } })
    if (!merchant) throw new NotFoundException('Merchant not found')
    return this.prisma.merchant.update({
      where: { id },
      data: { isActive: !merchant.isActive },
    })
  }

  async updateBankDetails(
    merchantId: string,
    data: { bankName: string; bankAccountName: string; bankAccountNumber: string }
  ) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data,
    })
  }

  async updateProfile(
    merchantId: string,
    data: { storeName?: string; description?: string; phone?: string; logoUrl?: string }
  ) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data,
    })
  }

  async getMenuItems(merchantId: string) {
    return this.prisma.menuItem.findMany({
      where: { merchantId },
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    })
  }

  async createMenuItem(
    merchantId: string,
    data: { name: string; description?: string; price: number; imageUrl?: string; prepTime?: number; categoryId: string }
  ) {
    const category = await this.prisma.category.findFirst({
      where: { id: data.categoryId, merchantId },
    })
    if (!category) throw new ForbiddenException('Category does not belong to this merchant')

    return this.prisma.menuItem.create({
      data: { ...data, merchantId },
    })
  }

  async updateMenuItem(
    merchantId: string,
    menuItemId: string,
    data: {
      name?: string
      description?: string
      price?: number
      imageUrl?: string
      isAvailable?: boolean
      prepTime?: number
      categoryId?: string
    }
  ) {
    const item = await this.prisma.menuItem.findFirst({ where: { id: menuItemId, merchantId } })
    if (!item) throw new NotFoundException('Menu item not found')

    return this.prisma.menuItem.update({
      where: { id: menuItemId },
      data,
    })
  }

  async deleteMenuItem(merchantId: string, menuItemId: string) {
    const item = await this.prisma.menuItem.findFirst({ where: { id: menuItemId, merchantId } })
    if (!item) throw new NotFoundException('Menu item not found')

    return this.prisma.menuItem.delete({ where: { id: menuItemId } })
  }

  async getCategories(merchantId: string) {
    return this.prisma.category.findMany({
      where: { merchantId },
      include: { _count: { select: { menuItems: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async createCategory(merchantId: string, data: { name: string; imageUrl?: string }) {
    return this.prisma.category.create({
      data: { ...data, merchantId },
    })
  }

  async deleteCategory(merchantId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({ where: { id: categoryId, merchantId } })
    if (!category) throw new NotFoundException('Category not found')

    return this.prisma.category.delete({ where: { id: categoryId } })
  }

  async getMerchantOrders(merchantId: string, status?: string, page = 1, limit = 50) {
    const where: any = { merchantId }
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { menuItem: { select: { name: true } } } },
          orderTable: { select: { number: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getMerchantStats(merchantId: string) {
    const [totalOrders, completedOrders, pendingOrders, revenueResult, todayResult] =
      await Promise.all([
        this.prisma.order.count({ where: { merchantId } }),
        this.prisma.order.count({ where: { merchantId, status: 'DELIVERED' } }),
        this.prisma.order.count({
          where: { merchantId, status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] } },
        }),
        this.prisma.order.aggregate({
          where: { merchantId, status: 'DELIVERED', paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.aggregate({
          where: {
            merchantId,
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          _count: true,
          _sum: { totalAmount: true },
        }),
      ])

    const totalRevenue = Number(revenueResult._sum.totalAmount || 0)
    const avgOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue,
      todayOrders: todayResult._count,
      todayRevenue: Number(todayResult._sum.totalAmount || 0),
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    }
  }

  async getRevenueTrend(merchantId: string, days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: {
        merchantId,
        createdAt: { gte: startDate },
        status: { in: ['DELIVERED', 'READY', 'PREPARING', 'ACCEPTED'] },
      },
      select: { createdAt: true, totalAmount: true },
    })

    const result: { date: Date; revenue: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const nextD = new Date(d)
      nextD.setDate(nextD.getDate() + 1)

      const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < nextD)

      result.push({
        date: new Date(d),
        revenue: dayOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
      })
    }

    return result
  }

  async getOrdersChart(merchantId: string, days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: {
        merchantId,
        createdAt: { gte: startDate },
      },
      select: { createdAt: true },
    })

    const result: { date: Date; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const nextD = new Date(d)
      nextD.setDate(nextD.getDate() + 1)

      const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < nextD)

      result.push({
        date: new Date(d),
        count: dayOrders.length,
      })
    }

    return result
  }

  async getTopMenuItems(merchantId: string, limit = 5) {
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        menuItem: { merchantId },
        order: { status: 'DELIVERED' },
      },
      select: {
        menuItemId: true,
        quantity: true,
        totalPrice: true,
        menuItem: { select: { name: true } },
      },
    })

    const itemMap = new Map<string, { name: string; count: number; revenue: number }>()

    for (const item of orderItems) {
      const existing = itemMap.get(item.menuItemId) || { name: item.menuItem.name, count: 0, revenue: 0 }
      existing.count += item.quantity
      existing.revenue += Number(item.totalPrice)
      itemMap.set(item.menuItemId, existing)
    }

    return Array.from(itemMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  async getOrderStatusBreakdown(merchantId: string) {
    const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const
    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.order.count({ where: { merchantId, status } })
      )
    )
    return statuses
      .map((status, i) => ({ status, count: counts[i] }))
      .filter((s) => s.count > 0)
  }

  async getHourlyDistribution(merchantId: string) {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: { merchantId, createdAt: { gte: todayStart } },
      select: { createdAt: true },
    })

    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourOrders = orders.filter((o) => new Date(o.createdAt).getHours() === i)
      return { hour: i, count: hourOrders.length }
    })

    const activeHours = hours.filter((h) => h.count > 0)
    if (activeHours.length === 0) {
      return { hours: hours.filter((h) => h.hour >= 8 && h.hour <= 22) }
    }

    return { hours }
  }
}
