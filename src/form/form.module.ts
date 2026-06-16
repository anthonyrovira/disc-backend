import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { FormCleanupService } from './form-cleanup.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';

@Module({
  providers: [FormService, FormCleanupService, PdfGeneratorService],
  controllers: [FormController],
})
export class FormModule {}
