import { Option } from './option.model';

export class Question {
  id: number;
  question: string;
  options: Option[];

  constructor(data: any) {
    this.id = data.id;
    this.question = data.question;
    this.options = data.options.map(
      (dataOption: any) => new Option(dataOption),
    );
  }
}
