import { Controller, Get, Param } from '@nestjs/common';
import { AppleService } from './apple.service';

@Controller('notifications')
export class AppleController {
  constructor(private readonly appleService: AppleService) {}

  @Get('')
  async sendTestNotification() {
    const res = await this.appleService.sendTestNotification();
    return res;
  }

}
