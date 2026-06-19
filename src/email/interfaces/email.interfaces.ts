export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, unknown>;
}
