import { UserDto, UpdateProfileDto } from './user.dto';
import { validate } from 'class-validator';

describe('UserDto', () => {
  it('should create an instance', () => {
    const userDto = new UserDto({
      id: '123',
      email: 'user@example.com',
      created_at: new Date('2023-07-01T10:00:00Z'),
      username: 'JohnDoe51',
      firstName: 'John',
      lastName: 'Doe',
      birthDate: new Date('1990-05-15'),
    });

    expect(userDto).toBeDefined();
    expect(userDto.id).toBe('123');
    expect(userDto.email).toBe('user@example.com');
    expect(userDto.username).toBe('JohnDoe51');
    expect(userDto.firstName).toBe('John');
    expect(userDto.lastName).toBe('Doe');
    expect(userDto.birthDate).toEqual(new Date('1990-05-15'));
    expect(userDto.created_at).toEqual(new Date('2023-07-01T10:00:00Z'));
  });

  it('should create an instance without optional properties', () => {
    const userDto = new UserDto({
      id: '123',
      email: 'user@example.com',
    });

    expect(userDto).toBeDefined();
    expect(userDto.id).toBe('123');
    expect(userDto.email).toBe('user@example.com');
    expect(userDto.username).toBeUndefined();
    expect(userDto.firstName).toBeUndefined();
    expect(userDto.lastName).toBeUndefined();
    expect(userDto.birthDate).toBeUndefined();
    expect(userDto.created_at).toBeUndefined();
  });
});

describe('UpdateProfileDto', () => {
  it('should accept valid data', async () => {
    const dto = new UpdateProfileDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'john@example.com';
    dto.username = 'johnny';
    dto.birthDate = '1990-05-15';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept empty DTO (all optional)', async () => {
    const dto = new UpdateProfileDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid email', async () => {
    const dto = new UpdateProfileDto();
    dto.email = 'not-an-email';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });

  it('should reject empty firstName', async () => {
    const dto = new UpdateProfileDto();
    dto.firstName = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('firstName');
  });

  it('should reject invalid birthDate', async () => {
    const dto = new UpdateProfileDto();
    dto.birthDate = 'not-a-date';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('birthDate');
  });
});
