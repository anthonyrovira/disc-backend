import { Option } from './option.dto';

describe('Option DTO', () => {
  it('should create a new option instance', () => {
    const id = 'a';
    const content = 'Option A';

    const option = new Option({ id, text: content });

    expect(option.id).toEqual(id);
    expect(option.content).toEqual(content);
  });
});
