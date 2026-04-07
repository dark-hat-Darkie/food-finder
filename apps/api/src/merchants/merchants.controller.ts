import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { MerchantsService } from './merchants.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MerchantJwtAuthGuard } from '../auth/merchant-jwt-auth.guard'

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private service: MerchantsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all merchants (admin)' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('search') search?: string) {
    return this.service.findAll(Number(page) || 1, Number(limit) || 20, search)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant by ID (admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve merchant (admin)' })
  approve(@Param('id') id: string) {
    return this.service.approve(id)
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject merchant (admin)' })
  reject(@Param('id') id: string) {
    return this.service.reject(id)
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle merchant active status (admin)' })
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(id)
  }

  @Get(':id/menu-items')
  @ApiOperation({ summary: 'Get merchant menu items (public/customer)' })
  getMenuItems(@Param('id') id: string) {
    return this.service.getMenuItems(id)
  }

  @Get(':id/categories')
  @ApiOperation({ summary: 'Get merchant categories (public/customer)' })
  getCategories(@Param('id') id: string) {
    return this.service.getCategories(id)
  }

  @Post(':id/menu-items')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create menu item (merchant)' })
  createMenuItem(
    @Param('id') merchantId: string,
    @Request() req: any,
    @Body() body: { name: string; description?: string; price: number; imageUrl?: string; prepTime?: number; categoryId: string }
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.createMenuItem(merchantId, body)
  }

  @Patch(':id/menu-items/:menuItemId')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu item (merchant)' })
  updateMenuItem(
    @Param('id') merchantId: string,
    @Param('menuItemId') menuItemId: string,
    @Request() req: any,
    @Body()
    body: {
      name?: string
      description?: string
      price?: number
      imageUrl?: string
      isAvailable?: boolean
      prepTime?: number
      categoryId?: string
    }
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.updateMenuItem(merchantId, menuItemId, body)
  }

  @Delete(':id/menu-items/:menuItemId')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete menu item (merchant)' })
  deleteMenuItem(
    @Param('id') merchantId: string,
    @Param('menuItemId') menuItemId: string,
    @Request() req: any
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.deleteMenuItem(merchantId, menuItemId)
  }

  @Post(':id/categories')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (merchant)' })
  createCategory(
    @Param('id') merchantId: string,
    @Request() req: any,
    @Body() body: { name: string; imageUrl?: string }
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.createCategory(merchantId, body)
  }

  @Delete(':id/categories/:categoryId')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (merchant)' })
  deleteCategory(
    @Param('id') merchantId: string,
    @Param('categoryId') categoryId: string,
    @Request() req: any
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.deleteCategory(merchantId, categoryId)
  }

  @Get(':id/orders')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant orders' })
  getOrders(
    @Param('id') merchantId: string,
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getMerchantOrders(merchantId, status, Number(page) || 1, Number(limit) || 50)
  }

  @Get(':id/stats')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant stats' })
  getStats(@Param('id') merchantId: string, @Request() req: any) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getMerchantStats(merchantId)
  }

  @Get(':id/analytics/revenue')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant revenue trend (last N days)' })
  getRevenueTrend(@Param('id') merchantId: string, @Request() req: any, @Query('days') days?: string) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getRevenueTrend(merchantId, Number(days) || 7)
  }

  @Get(':id/analytics/orders')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant orders chart (last N days)' })
  getOrdersChart(@Param('id') merchantId: string, @Request() req: any, @Query('days') days?: string) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getOrdersChart(merchantId, Number(days) || 7)
  }

  @Get(':id/analytics/top-items')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant top selling menu items' })
  getTopItems(@Param('id') merchantId: string, @Request() req: any, @Query('limit') limit?: string) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getTopMenuItems(merchantId, Number(limit) || 5)
  }

  @Get(':id/analytics/order-status-breakdown')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant order status breakdown' })
  getOrderStatusBreakdown(@Param('id') merchantId: string, @Request() req: any) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getOrderStatusBreakdown(merchantId)
  }

  @Get(':id/analytics/hourly-distribution')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get merchant today's hourly order distribution" })
  getHourlyDistribution(@Param('id') merchantId: string, @Request() req: any) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.getHourlyDistribution(merchantId)
  }

  @Patch(':id/bank-details')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bank details (merchant)' })
  updateBankDetails(
    @Param('id') merchantId: string,
    @Request() req: any,
    @Body() body: { bankName: string; bankAccountName: string; bankAccountNumber: string }
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.updateBankDetails(merchantId, body)
  }

  @Patch(':id/profile')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update merchant profile' })
  updateProfile(
    @Param('id') merchantId: string,
    @Request() req: any,
    @Body() body: { storeName?: string; description?: string; phone?: string; logoUrl?: string }
  ) {
    if (req.user.sub !== merchantId) return { error: 'Forbidden' }
    return this.service.updateProfile(merchantId, body)
  }
}
