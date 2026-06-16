import { Test, TestingModule } from '@nestjs/testing';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { InitFormDto } from './dto/form.dto';

describe('FormController', () => {
  let controller: FormController;
  let service: FormService;
  let pdfService: PdfGeneratorService;

  const mockPdfBuffer = Buffer.from('%PDF mock');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormController],
      providers: [
        {
          provide: FormService,
          useValue: {
            getForms: jest.fn(),
            getFormById: jest.fn(),
            getNextQuestion: jest.fn(),
            getFormQuestion: jest.fn(),
            getDiscResult: jest.fn(),
            initForm: jest.fn(),
            submitFormAnswer: jest.fn(),
            updateFormAnswer: jest.fn(),
            deleteForm: jest.fn(),
          },
        },
        {
          provide: PdfGeneratorService,
          useValue: {
            generatePdf: jest.fn().mockResolvedValue(mockPdfBuffer),
          },
        },
      ],
    }).compile();

    controller = module.get<FormController>(FormController);
    service = module.get<FormService>(FormService);
    pdfService = module.get<PdfGeneratorService>(PdfGeneratorService);
  });

  it('should call initForm', async () => {
    const dto: InitFormDto = { name: 'Test' };
    const mockUser = { id: 'uid', email: 'test@test.com' };

    await controller.initForm(dto, mockUser as any);

    expect(service.initForm).toHaveBeenCalledWith('Test', 'uid');
  });

  it('should call getNextQuestion', async () => {
    await controller.getNextQuestion('form-id');

    expect(service.getNextQuestion).toHaveBeenCalledWith('form-id');
  });

  it('should call submitFormAnswer', async () => {
    const dto = { questionId: 'uuid-1', optionValue: '01_A' };

    await controller.submitAnswer('form-id', dto);

    expect(service.submitFormAnswer).toHaveBeenCalledWith('form-id', 'uuid-1', '01_A');
  });

  it('should call updateFormAnswer', async () => {
    const dto = { optionValue: '01_B' };

    await controller.updateAnswer('form-id', '1', dto);

    expect(service.updateFormAnswer).toHaveBeenCalledWith('form-id', '1', '01_B');
  });

  it('should call getDiscResult', async () => {
    await controller.getDiscResult('form-id');

    expect(service.getDiscResult).toHaveBeenCalledWith('form-id');
  });

  it('should call deleteForm', async () => {
    const mockUser = { id: 'uid', email: 'test@test.com' };

    await controller.deleteForm('form-id', mockUser as any);

    expect(service.deleteForm).toHaveBeenCalledWith('form-id', 'uid');
  });

  describe('downloadPdf', () => {
    it('should return PDF with correct headers', async () => {
      const mockResult = {
        primary: 'D',
        secondary: 'S',
        scores: { D: 9, I: 7, S: 8, C: 6 },
        total: 30,
        name: 'Test',
        profile: {
          title: 'Profil',
          description: 'Desc',
          tags: [],
          strengths: [],
          pitfalls: [],
          howToCommunicateWithMe: [],
        },
        synergies: [],
        answers: [],
        categoryScores: [],
      };

      (service.getDiscResult as jest.Mock).mockResolvedValue(mockResult);

      const res = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.downloadPdf('form-id', res as any);

      expect(service.getDiscResult).toHaveBeenCalledWith('form-id');
      expect(pdfService.generatePdf).toHaveBeenCalledWith(mockResult);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Rapport_DISC_DS_form-id.pdf"',
      });
      expect(res.end).toHaveBeenCalledWith(mockPdfBuffer);
    });

    it('should handle single-dimension profile code', async () => {
      const mockResult = {
        primary: 'D',
        secondary: null,
        scores: { D: 9, I: 7, S: 8, C: 6 },
        total: 30,
        name: 'Test',
        profile: {
          title: 'Profil',
          description: 'Desc',
          tags: [],
          strengths: [],
          pitfalls: [],
          howToCommunicateWithMe: [],
        },
        synergies: [],
        answers: [],
        categoryScores: [],
      };

      (service.getDiscResult as jest.Mock).mockResolvedValue(mockResult);

      const res = {
        set: jest.fn(),
        end: jest.fn(),
      };

      await controller.downloadPdf('form-id', res as any);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'attachment; filename="Rapport_DISC_D_form-id.pdf"',
        }),
      );
    });
  });
});
