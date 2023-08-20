// form.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { InitFormDto } from 'src/core/dtos';

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
            initForm: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FormController>(FormController);
    service = module.get<FormService>(FormService);
  });

  it('should call initForm method', async () => {
    const dto: InitFormDto = {
      name: 'Test Form',
      userId: '123',
    };

    await controller.initForm(dto);

    expect(service.initForm).toHaveBeenCalledWith(dto);
  });
});
