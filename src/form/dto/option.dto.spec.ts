import { Option } from './option.dto';

describe('Option DTO', () => {
  it('should create a new option instance', () => {
    const content = 'Red';
    const value = '01_A';

    const data: Option = {
      content: 'Red',
      value: '01_A',
    };

    const optionDto = new Option(data);

    expect(optionDto.content).toEqual(content);
    expect(optionDto.value).toEqual(value);
  });
});
