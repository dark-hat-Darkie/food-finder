import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    tableId: string
    foodCourtId: string
    merchantId: string
    items: { menuItemId: string; quantity: number; specialInstructions?: string }[]
    customerNote?: string
    customerPhone: string
  }) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: data.items.map((i) => i.menuItemId) } },
    })

    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)
      if (!menuItem) throw new NotFoundException(`Menu item ${item.menuItemId} not found`)

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: Number(menuItem.price) * item.quantity,
        specialInstructions: item.specialInstructions,
      }
    })

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        totalAmount,
        customerNote: data.customerNote,
        customerPhone: data.customerPhone,
        tableId: data.tableId,
        foodCourtId: data.foodCourtId,
        merchantId: data.merchantId,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: { include: { menuItem: { select: { name: true } } } },
        orderTable: { select: { number: true } },
      },
    })

    return order
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
        orderTable: { select: { number: true } },
        merchant: { select: { storeName: true } },
      },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: { include: { menuItem: { select: { name: true, imageUrl: true } } } },
        orderTable: { select: { number: true } },
        merchant: { select: { storeName: true } },
      },
    })
    if (!order) throw new NotFoundException('Order not found')
    return order
  }

  async updateStatus(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundException('Order not found')

    const updateData: any = { status }
    if (status === 'DELIVERED') {
      updateData.paymentStatus = 'PAID'
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: { include: { menuItem: { select: { name: true } } } },
        orderTable: { select: { number: true } },
      },
    })
  }

  async findAll(page = 1, limit = 20, filters?: { status?: string; merchantId?: string; foodCourtId?: string }) {
    const where: any = {}
    if (filters?.status) where.status = filters.status
    if (filters?.merchantId) where.merchantId = filters.merchantId
    if (filters?.foodCourtId) where.foodCourtId = filters.foodCourtId

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: { include: { menuItem: { select: { name: true } } } },
          orderTable: { select: { number: true } },
          merchant: { select: { storeName: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getDashboardStats() {
    const [totalOrders, totalMerchants, totalFoodCourts, revenueResult, todayResult, pendingPayments] =
      await Promise.all([
        this.prisma.order.count(),
        this.prisma.merchant.count({ where: { isActive: true, isApproved: true } }),
        this.prisma.foodCourt.count({ where: { isActive: true } }),
        this.prisma.order.aggregate({
          where: { status: 'DELIVERED', paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
        this.prisma.order.aggregate({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
          _count: true,
          _sum: { totalAmount: true },
        }),
        this.prisma.merchantPayment.count({ where: { status: 'PENDING' } }),
      ])

    return {
      totalRevenue: Number(revenueResult._sum.totalAmount || 0),
      totalOrders,
      totalMerchants,
      totalFoodCourts,
      todayOrders: todayResult._count,
      todayRevenue: Number(todayResult._sum.totalAmount || 0),
      pendingMerchantPayments: pendingPayments,
    }
  }

  async getRevenueTrend(days = 7) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['DELIVERED', 'READY', 'PREPARING', 'ACCEPTED'] },
      },
      select: { createdAt: true, totalAmount: true },
    })

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const result: { date: string; revenue: number; orders: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const nextD = new Date(d)
      nextD.setDate(nextD.getDate() + 1)

      const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < nextD)
      const label = days <= 7
        ? daysOfWeek[d.getDay()]
        : `${months[d.getMonth()]} ${d.getDate()}`

      result.push({
        date: label,
        revenue: dayOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
        orders: dayOrders.length,
      })
    }

    return result
  }

  async getOrderStatusDistribution() {
    const statuses = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] as const
    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.order.count({ where: { status } })
      )
    )
    return statuses.map((name, i) => ({ name, value: counts[i] })).filter((s) => s.value > 0)
  }

  async getTopMerchants(limit = 5) {
    const merchants = await this.prisma.merchant.findMany({
      where: { isActive: true, isApproved: true },
      select: {
        id: true,
        storeName: true,
        orders: {
          where: { status: 'DELIVERED' },
          select: { totalAmount: true },
        },
        _count: { select: { orders: true } },
      },
    })

    return merchants
      .map((m) => ({
        name: m.storeName,
        revenue: m.orders.reduce((s, o) => s + Number(o.totalAmount), 0),
        orders: m._count.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        merchant: { select: { storeName: true } },
        orderTable: { select: { number: true } },
      },
    })
  }

  async getHourlyOrderDistribution() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: todayStart } },
      select: { createdAt: true, totalAmount: true },
    })

    const hours = Array.from({ length: 24 }, (_, i) => {
      const label = i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
      const hourOrders = orders.filter((o) => new Date(o.createdAt).getHours() === i)
      return {
        hour: label,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((s, o) => s + Number(o.totalAmount), 0),
      }
    })

    return hours.filter((h) => h.orders > 0).length > 0 ? hours : hours
  }

  async getFoodCourtPerformance() {
    const foodCourts = await this.prisma.foodCourt.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        orders: {
          select: { totalAmount: true, status: true },
        },
        _count: { select: { merchants: true, tables: true } },
      },
    })

    return foodCourts.map((fc) => ({
      name: fc.name,
      revenue: fc.orders.reduce((s, o) => s + Number(o.totalAmount), 0),
      orders: fc.orders.length,
      merchants: fc._count.merchants,
      tables: fc._count.tables,
    }))
  }
}
