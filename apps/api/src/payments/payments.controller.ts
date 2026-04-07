import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MerchantJwtAuthGuard } from '../auth/merchant-jwt-auth.guard'

@ApiTags('Payments')
@Controller('merchant-payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all payments (admin)' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('status') status?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 20, status)
  }

  @Get('merchant')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant payment history' })
  findByMerchant(@Request() req: any) {
    return this.service.findByMerchant(req.user.sub)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment (admin)' })
  create(
    @Body()
    body: {
      merchantId: string
      amount: number
      referenceNumber?: string
      notes?: string
      periodStart: string
      periodEnd: string
    }
  ) {
    return this.service.create(body)
  }

  @Patch(':id/mark-paid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark payment as paid (admin)' })
  markPaid(@Param('id') id: string, @Body() body: { referenceNumber?: string; notes?: string }) {
    return this.service.markPaid(id, body.referenceNumber, body.notes)
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve payment (admin)' })
  approve(@Param('id') id: string) {
    return this.service.approve(id)
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject payment (admin)' })
  reject(@Param('id') id: string) {
    return this.service.reject(id)
  }
}
