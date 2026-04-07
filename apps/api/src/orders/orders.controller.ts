import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MerchantJwtAuthGuard } from '../auth/merchant-jwt-auth.guard'

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order (customer — no auth)' })
  create(
    @Body()
    body: {
      tableId: string
      foodCourtId: string
      merchantId: string
      items: { menuItemId: string; quantity: number; specialInstructions?: string }[]
      customerNote?: string
      customerPhone: string
    }
  ) {
    return this.service.create(body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (admin)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('merchantId') merchantId?: string,
    @Query('foodCourtId') foodCourtId?: string
  ) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 20, {
      status,
      merchantId,
      foodCourtId,
    })
  }

  @Get('stats/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard stats (admin)' })
  getDashboardStats() {
    return this.service.getDashboardStats()
  }

  @Get('stats/revenue-trend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revenue trend (last N days)' })
  getRevenueTrend(@Query('days') days?: string) {
    return this.service.getRevenueTrend(Number(days) || 7)
  }

  @Get('stats/status-distribution')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Order status distribution' })
  getStatusDistribution() {
    return this.service.getOrderStatusDistribution()
  }

  @Get('stats/top-merchants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Top merchants by revenue' })
  getTopMerchants(@Query('limit') limit?: string) {
    return this.service.getTopMerchants(Number(limit) || 5)
  }

  @Get('stats/recent-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Recent orders' })
  getRecentOrders(@Query('limit') limit?: string) {
    return this.service.getRecentOrders(Number(limit) || 10)
  }

  @Get('stats/hourly-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Today's hourly order distribution" })
  getHourlyOrders() {
    return this.service.getHourlyOrderDistribution()
  }

  @Get('stats/food-court-performance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Food court performance comparison' })
  getFoodCourtPerformance() {
    return this.service.getFoodCourtPerformance()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Get('number/:orderNumber')
  @ApiOperation({ summary: 'Get order by order number' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.service.findByOrderNumber(orderNumber)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (merchant/admin)' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req: any) {
    return this.service.updateStatus(id, body.status)
  }
}
