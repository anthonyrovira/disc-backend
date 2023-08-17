import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { AppService } from 'src/app/app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Get Hello World' })
  @ApiOkResponse({ type: Object })
  @Get()
  getHello(): { message: string } {
    return this.appService.getHello();
  }
}
