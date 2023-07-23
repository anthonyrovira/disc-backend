import { User } from './user.dto';

describe('User DTO', () => {
  it('should create a new user instance', () => {
    const id = '1';
    const name = 'John Doe';
    const email = 'johndoe@example.com';

    const user = new User(id, name, email);

    expect(user.id).toEqual(id);
    expect(user.name).toEqual(name);
    expect(user.email).toEqual(email);
  });
});
