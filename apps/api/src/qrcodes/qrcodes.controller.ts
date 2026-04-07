import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { QrcodesService } from './qrcodes.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@ApiTags('QR Codes')
@Controller('qrcodes')
export class QrcodesController {
  constructor(private service: QrcodesService) {}

  @Post('generate/:tableId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR code for a table (admin)' })
  generateForTable(@Param('tableId') tableId: string) {
    return this.service.generateForTable(tableId)
  }

  @Post('generate-court/:foodCourtId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate QR codes for all tables in a food court (admin)' })
  generateForFoodCourt(@Param('foodCourtId') foodCourtId: string) {
    return this.service.generateForFoodCourt(foodCourtId)
  }

  @Get('table/:tableId')
  @ApiOperation({ summary: 'Get QR code for a table' })
  getTableQr(@Param('tableId') tableId: string) {
    return this.service.getTableQr(tableId)
  }
}
