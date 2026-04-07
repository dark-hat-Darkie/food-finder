import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { MerchantJwtAuthGuard } from './merchant-jwt-auth.guard'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Admin login' })
  adminLogin(@Body() body: { email: string; password: string }) {
    return this.authService.adminLogin(body.email, body.password)
  }

  @Post('merchant/login')
  @ApiOperation({ summary: 'Merchant login' })
  merchantLogin(@Body() body: { email: string; password: string }) {
    return this.authService.merchantLogin(body.email, body.password)
  }

  @Post('merchant/register')
  @ApiOperation({ summary: 'Merchant register' })
  merchantRegister(
    @Body()
    body: {
      email: string
      password: string
      storeName: string
      ownerName: string
      phone?: string
      description?: string
      foodCourtId: string
    }
  ) {
    return this.authService.merchantRegister(body)
  }

  @Get('merchant/profile')
  @UseGuards(MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant profile' })
  getMerchantProfile(@Request() req: any) {
    return this.authService.getMerchantProfile(req.user.sub)
  }
}
