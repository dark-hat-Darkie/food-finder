import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FoodCourtsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.foodCourt.findMany({
      include: {
        _count: { select: { tables: true, merchants: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const court = await this.prisma.foodCourt.findUnique({
      where: { id },
      include: {
        tables: { orderBy: { number: 'asc' } },
        merchants: {
          where: { isActive: true, isApproved: true },
          select: {
            id: true,
            storeName: true,
            description: true,
            logoUrl: true,
            _count: { select: { menuItems: { where: { isAvailable: true } } } },
          },
        },
      },
    })
    if (!court) throw new NotFoundException('Food court not found')
    return court
  }

  async findBySlug(slug: string) {
    const court = await this.prisma.foodCourt.findUnique({
      where: { slug },
      include: {
        tables: { orderBy: { number: 'asc' } },
        merchants: {
          where: { isActive: true, isApproved: true },
          select: {
            id: true,
            storeName: true,
            description: true,
            logoUrl: true,
            _count: { select: { menuItems: { where: { isAvailable: true } } } },
          },
        },
      },
    })
    if (!court) throw new NotFoundException('Food court not found')
    return court
  }

  async create(data: { name: string; slug: string; address?: string; location?: string; imageUrl?: string }) {
    return this.prisma.foodCourt.create({ data })
  }

  async update(
    id: string,
    data: { name?: string; slug?: string; address?: string; location?: string; imageUrl?: string; isActive?: boolean }
  ) {
    return this.prisma.foodCourt.update({ where: { id }, data })
  }

  async delete(id: string) {
    return this.prisma.foodCourt.delete({ where: { id } })
  }

  async getTables(foodCourtId: string) {
    return this.prisma.table.findMany({
      where: { foodCourtId },
      orderBy: { number: 'asc' },
    })
  }

  async createTable(foodCourtId: string, number: number) {
    return this.prisma.table.create({
      data: { number, foodCourtId },
    })
  }

  async deleteTable(id: string) {
    return this.prisma.table.delete({ where: { id } })
  }

  async getMerchantsForCustomer(foodCourtId: string) {
    return this.prisma.merchant.findMany({
      where: { foodCourtId, isActive: true, isApproved: true },
      select: {
        id: true,
        storeName: true,
        description: true,
        logoUrl: true,
        categories: {
          include: {
            menuItems: {
              where: { isAvailable: true },
            },
          },
        },
      },
    })
  }
}
