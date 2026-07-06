import { Module } from '@nestjs/common';
import { FormService } from './form.service';
import { FormController } from './form.controller';
import { PdfGeneratorService } from './pdf/pdf-generator.service';

@Module({
  providers: [FormService, PdfGeneratorService],
  controllers: [FormController],
})
export class FormModule {}
