import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MerchantJwtAuthGuard } from '../auth/merchant-jwt-auth.guard'

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private service: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard, MerchantJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.service.uploadImage(file)
  }
}
