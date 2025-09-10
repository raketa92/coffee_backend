export interface IEmailContent {
  subject: string;
  html?: string;
  text?: string;
}

export interface ISendEmailPayload {
  to: string | string[];
  content: IEmailContent;
  template?: {
    name: string;
    variables: Record<string, any>;
  };
}

export abstract class IEmailSender {
  abstract send(payload: ISendEmailPayload): Promise<void>;
}
