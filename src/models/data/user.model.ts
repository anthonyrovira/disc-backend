export class User {
  id: string;
  name: string;
  email: string;
  created_at?: Date;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}
