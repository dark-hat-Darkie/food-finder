import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, status?: string) {
    const where: any = {}
    if (status) where.status = status

    const [data, total] = await Promise.all([
      this.prisma.merchantPayment.findMany({
        where,
        include: { merchant: { select: { storeName: true, ownerName: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchantPayment.count({ where }),
    ])

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findByMerchant(merchantId: string) {
    return this.prisma.merchantPayment.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: {
    merchantId: string
    amount: number
    referenceNumber?: string
    notes?: string
    periodStart: string
    periodEnd: string
  }) {
    return this.prisma.merchantPayment.create({ data })
  }

  async markPaid(id: string, referenceNumber?: string, notes?: string) {
    const payment = await this.prisma.merchantPayment.findUnique({ where: { id } })
    if (!payment) throw new NotFoundException('Payment not found')

    const updated = await this.prisma.merchantPayment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        referenceNumber: referenceNumber || payment.referenceNumber,
        notes: notes || payment.notes,
      },
    })

    await this.prisma.merchant.update({
      where: { id: payment.merchantId },
      data: { balance: { decrement: payment.amount } },
    })

    return updated
  }

  async approve(id: string) {
    return this.prisma.merchantPayment.update({
      where: { id },
      data: { status: 'APPROVED' },
    })
  }

  async reject(id: string) {
    return this.prisma.merchantPayment.update({
      where: { id },
      data: { status: 'REJECTED' },
    })
  }
}
