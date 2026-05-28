import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { FormCleanupService } from './form-cleanup.service';

@Module({
  providers: [FormService, FormCleanupService],
  controllers: [FormController],
})
export class FormModule {}
