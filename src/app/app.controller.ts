import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from '@/app/app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get Hello World' })
  @ApiResponse({ type: Object })
  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
