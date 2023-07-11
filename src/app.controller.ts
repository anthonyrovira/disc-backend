import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get Hello World' })
  @ApiOkResponse({ type: String })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
