import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FormService } from './form.service';

@Injectable()
export class FormCleanupService {
  private readonly logger = new Logger(FormCleanupService.name);

  constructor(private formService: FormService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOrphanedForms(): Promise<void> {
    const count = await this.formService.cleanupOrphanedForms();
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} orphaned anonymous form(s)`);
    }
  }
}
