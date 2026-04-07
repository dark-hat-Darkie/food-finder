import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FoodCourtsService } from './food-courts.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('Food Courts')
@Controller('food-courts')
export class FoodCourtsController {
  constructor(private service: FoodCourtsService) {}

  @Get()
  @ApiOperation({ summary: 'List all food courts (public)' })
  findAll() {
    return this.service.findAll()
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get food court by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food court by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Get(':id/merchants')
  @ApiOperation({ summary: 'Get merchants for a food court (customer)' })
  getMerchants(@Param('id') id: string) {
    return this.service.getMerchantsForCustomer(id)
  }

  @Get(':id/tables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tables for a food court (admin)' })
  getTables(@Param('id') id: string) {
    return this.service.getTables(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create food court (admin)' })
  create(
    @Body() body: { name: string; slug: string; address?: string; location?: string; imageUrl?: string }
  ) {
    return this.service.create(body)
  }

  @Post(':id/tables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add table to food court (admin)' })
  createTable(@Param('id') foodCourtId: string, @Body() body: { number: number }) {
    return this.service.createTable(foodCourtId, body.number)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update food court (admin)' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string
      slug?: string
      address?: string
      location?: string
      imageUrl?: string
      isActive?: boolean
    }
  ) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete food court (admin)' })
  delete(@Param('id') id: string) {
    return this.service.delete(id)
  }

  @Delete(':foodCourtId/tables/:tableId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete table (admin)' })
  deleteTable(@Param('tableId') tableId: string) {
    return this.service.deleteTable(tableId)
  }
}
