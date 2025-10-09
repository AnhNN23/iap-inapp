import { Module } from '@nestjs/common';
import { AppleController } from './apple/apple.controller';
import { AppleService } from './apple/apple.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
  ],
  controllers: [AppleController],
  providers: [AppleService],
})
export class AppModule {}
