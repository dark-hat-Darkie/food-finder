import { Module } from '@nestjs/common'
import { FoodCourtsController } from './food-courts.controller'
import { FoodCourtsService } from './food-courts.service'

@Module({
  controllers: [FoodCourtsController],
  providers: [FoodCourtsService],
})
export class FoodCourtsModule {}
