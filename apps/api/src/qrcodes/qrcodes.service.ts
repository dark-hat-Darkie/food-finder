import { Injectable, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import * as QRCode from 'qrcode'

@Injectable()
export class QrcodesService {
  private baseUrl: string

  constructor(
    private prisma: PrismaService,
    private config: ConfigService
  ) {
    this.baseUrl = this.config.get('BASE_URL', 'http://localhost:3000')
  }

  async generateForTable(tableId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: { foodCourt: true },
    })
    if (!table) throw new NotFoundException('Table not found')

    const qrUrl = `${this.baseUrl}/order/${table.foodCourt.slug}/${table.number}`
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 512,
      margin: 2,
    })

    const updated = await this.prisma.table.update({
      where: { id: tableId },
      data: { qrCodeUrl: qrUrl },
    })

    return { table: updated, qrDataUrl, qrUrl }
  }

  async generateForFoodCourt(foodCourtId: string) {
    const tables = await this.prisma.table.findMany({
      where: { foodCourtId },
      include: { foodCourt: true },
      orderBy: { number: 'asc' },
    })

    if (tables.length === 0) throw new NotFoundException('No tables found')

    const results = []
    for (const table of tables) {
      const qrUrl = `${this.baseUrl}/order/${table.foodCourt.slug}/${table.number}`
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 512, margin: 2 })

      await this.prisma.table.update({
        where: { id: table.id },
        data: { qrCodeUrl: qrUrl },
      })

      results.push({
        tableId: table.id,
        tableNumber: table.number,
        qrUrl,
        qrDataUrl,
      })
    }

    return results
  }

  async getTableQr(tableId: string) {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } })
    if (!table) throw new NotFoundException('Table not found')

    if (!table.qrCodeUrl) {
      return this.generateForTable(tableId)
    }

    const qrDataUrl = await QRCode.toDataURL(table.qrCodeUrl, { width: 512, margin: 2 })
    return { table, qrDataUrl, qrUrl: table.qrCodeUrl }
  }
}
