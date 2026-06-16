import { Test } from '@nestjs/testing';
import { PdfGeneratorService } from '../pdf-generator.service';
import puppeteer from 'puppeteer';
import type { DiscResultDto } from '../../dto/disc-result.dto';

const mockPdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');

const mockPage = {
  setContent: jest.fn().mockResolvedValue(undefined),
  pdf: jest.fn().mockResolvedValue(mockPdfBuffer),
};

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(undefined),
};

(puppeteer.launch as jest.Mock).mockResolvedValue(mockBrowser);

const mockResultData: DiscResultDto = {
  name: 'Test DISC',
  scores: { D: 9, I: 7, S: 8, C: 6 },
  primary: 'D',
  secondary: 'S',
  total: 30,
  profile: {
    title: 'Le Réalisateur Persévérant',
    description: 'Vous combinez l\'intensité...',
    tags: ['Orienté Résultats', 'Pilier Fiable'],
    strengths: [
      { title: 'Décisif', text: 'Vous prenez des décisions rapidement.' },
    ],
    pitfalls: [
      { title: 'Impatience', text: 'Vous supportez mal les lenteurs.' },
    ],
    howToCommunicateWithMe: ['Soyez directs et précis'],
  },
  synergies: [
    {
      targetDimension: 'I',
      targetLabel: 'L\'Animateur',
      concordance: 'Vous partagez un rythme rapide.',
      discordance: 'L\'Influent cherche la reconnaissance.',
      communicationGuide: ['Prenez le temps d\'échanger.'],
    },
  ],
  answers: [
    {
      questionId: 'q1',
      questionContent: 'Question test ?',
      optionValue: '01_A',
      optionContent: 'Réponse test',
      dimension: 'D',
    },
  ],
  categoryScores: [
    {
      category: 'Travail',
      scores: { D: 3, I: 2, S: 1, C: 1 },
      dominant: 'D',
      total: 7,
    },
  ],
};

describe('PdfGeneratorService', () => {
  let service: PdfGeneratorService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [PdfGeneratorService],
    }).compile();

    service = module.get(PdfGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should launch puppeteer with correct args', async () => {
    await service.generatePdf(mockResultData);

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  });

  it('should call page.setContent with html and waitUntil networkidle0', async () => {
    await service.generatePdf(mockResultData);

    expect(mockPage.setContent).toHaveBeenCalledTimes(1);
    expect(mockPage.setContent).toHaveBeenCalledWith(
      expect.any(String),
      { waitUntil: 'networkidle0' },
    );
  });

  it('should generate PDF with A4 format and printBackground true', async () => {
    await service.generatePdf(mockResultData);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
        printBackground: true,
      }),
    );
  });

  it('should return a Buffer', async () => {
    const result = await service.generatePdf(mockResultData);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(mockPdfBuffer);
  });

  it('should close the browser after generation', async () => {
    await service.generatePdf(mockResultData);

    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it('should close the browser even if pdf generation fails', async () => {
    mockPage.pdf.mockRejectedValueOnce(new Error('PDF error'));

    await expect(service.generatePdf(mockResultData)).rejects.toThrow('PDF error');
    expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  });

  it('should include header and footer', async () => {
    await service.generatePdf(mockResultData);

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        displayHeaderFooter: true,
        footerTemplate: expect.any(String),
      }),
    );
  });
});
