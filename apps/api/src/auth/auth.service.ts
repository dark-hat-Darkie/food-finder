import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async adminLogin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } })
    if (!admin) throw new UnauthorizedException('Invalid credentials')

    const isValid = await bcrypt.compare(password, admin.password)
    if (!isValid) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    return {
      accessToken: token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    }
  }

  async merchantLogin(email: string, password: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { email } })
    if (!merchant) throw new UnauthorizedException('Invalid credentials')
    if (!merchant.isActive || !merchant.isApproved)
      throw new UnauthorizedException('Account not active or not approved')

    const isValid = await bcrypt.compare(password, merchant.password)
    if (!isValid) throw new UnauthorizedException('Invalid credentials')

    const token = this.jwtService.sign({
      sub: merchant.id,
      email: merchant.email,
      storeName: merchant.storeName,
      type: 'merchant',
    })

    return {
      accessToken: token,
      user: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.storeName,
        role: 'merchant',
      },
    }
  }

  async merchantRegister(data: {
    email: string
    password: string
    storeName: string
    ownerName: string
    phone?: string
    description?: string
    foodCourtId: string
  }) {
    const existing = await this.prisma.merchant.findUnique({ where: { email: data.email } })
    if (existing) throw new UnauthorizedException('Email already registered')

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const merchant = await this.prisma.merchant.create({
      data: {
        email: data.email,
        password: hashedPassword,
        storeName: data.storeName,
        ownerName: data.ownerName,
        phone: data.phone,
        description: data.description,
        foodCourtId: data.foodCourtId,
      },
    })

    const token = this.jwtService.sign({
      sub: merchant.id,
      email: merchant.email,
      storeName: merchant.storeName,
      type: 'merchant',
    })

    return {
      accessToken: token,
      user: {
        id: merchant.id,
        email: merchant.email,
        name: merchant.storeName,
        role: 'merchant',
      },
    }
  }

  async getMerchantProfile(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      include: { foodCourt: true },
    })
    if (!merchant) throw new UnauthorizedException('Merchant not found')

    const { password, ...result } = merchant
    return result
  }
}
