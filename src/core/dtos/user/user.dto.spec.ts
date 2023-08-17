import { UserDto } from './user.dto';

describe('UserDto', () => {
  it('should create an instance', () => {
    const userDto = new UserDto(
      '123',
      'user@example.com',
      'JohnDoe51',
      new Date('2023-07-01T10:00:00Z'),
    );

    expect(userDto).toBeDefined();
    expect(userDto.id).toBe('123');
    expect(userDto.email).toBe('user@example.com');
    expect(userDto.username).toBe('JohnDoe51');
    expect(userDto.created_at).toEqual(new Date('2023-07-01T10:00:00Z'));
  });

  it('should create an instance without optional properties', () => {
    const userDto = new UserDto('123', 'user@example.com');

    expect(userDto).toBeDefined();
    expect(userDto.id).toBe('123');
    expect(userDto.email).toBe('user@example.com');
    expect(userDto.username).toBeUndefined();
    expect(userDto.created_at).toBeUndefined();
  });
});
