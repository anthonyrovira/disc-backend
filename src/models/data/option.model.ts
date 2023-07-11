export class Option {
  id: string;
  content: string;

  constructor(data: any) {
    this.id = data.id;
    this.content = data.text;
  }
}
