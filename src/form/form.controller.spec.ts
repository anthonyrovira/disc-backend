import { Test, TestingModule } from '@nestjs/testing';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { InitFormDto } from './dto/form.dto';

describe('FormController', () => {
  let controller: FormController;
  let service: FormService;

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
      ],
    }).compile();

    controller = module.get<FormController>(FormController);
    service = module.get<FormService>(FormService);
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
});
