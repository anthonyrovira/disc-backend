import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return the hello message', () => {
    const result = service.getHello();
    expect(result).toBeDefined();
    expect(result.message).toBe('Hello World!');
  });
});
