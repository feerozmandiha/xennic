export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailProvider {
  send(input: SendMailInput): Promise<void>;
  isEnabled(): boolean;
}
