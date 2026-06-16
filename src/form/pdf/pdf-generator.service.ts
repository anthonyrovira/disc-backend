import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import type { DiscResultDto } from '../dto/disc-result.dto';
import { buildPdfHtml } from './html-template';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generatePdf(data: DiscResultDto): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      const html = buildPdfHtml(data);

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        footerTemplate: `
          <div style="width:100%;font-family:Inter,system-ui,sans-serif;font-size:8px;color:#94a3b8;text-align:center;padding:8px 35px;">
            Page <span class="pageNumber"/> sur <span class="totalPages"/>
          </div>`,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Failed to generate PDF', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
