import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { FoodCourtsModule } from './food-courts/food-courts.module'
import { MerchantsModule } from './merchants/merchants.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'
import { QrcodesModule } from './qrcodes/qrcodes.module'
import { UploadModule } from './upload/upload.module'
import { WebsocketModule } from './websocket/websocket.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    FoodCourtsModule,
    MerchantsModule,
    OrdersModule,
    PaymentsModule,
    QrcodesModule,
    UploadModule,
    WebsocketModule,
  ],
})
export class AppModule {}
