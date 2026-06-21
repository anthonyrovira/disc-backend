import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import { SendEmailOptions } from './interfaces/email.interfaces';
import GenericEmail from './templates/GenericEmail';
import TeamMemberInvitationEmail from './templates/TeamMemberInvitationEmail';
import CandidateInvitationEmail from './templates/CandidateInvitationEmail';
import InvitationAcceptedEmail from './templates/InvitationAcceptedEmail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromAddress: string;
  readonly appUrl: string;
  private readonly templates: Map<string, React.ComponentType<any>> = new Map();

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set — emails will not be sent');
    }
    this.resend = new Resend(apiKey ?? '');

    this.fromAddress =
      this.config.get<string>('EMAIL_FROM') ?? 'noreply@disc.dev';
    this.appUrl =
      this.config.get<string>('APP_URL') ?? 'http://localhost:5173';

    this.templates.set('generic', GenericEmail);
    this.templates.set('team-member-invitation', TeamMemberInvitationEmail);
    this.templates.set('candidate-invitation', CandidateInvitationEmail);
    this.templates.set('invitation-accepted', InvitationAcceptedEmail);
  }

  registerTemplate(name: string, component: React.ComponentType<any>): void {
    this.templates.set(name, component);
  }

  async send(options: SendEmailOptions): Promise<void> {
    const TemplateComponent = this.templates.get(options.template);

    if (!TemplateComponent) {
      throw new Error(`Email template "${options.template}" not found`);
    }

    const element = React.createElement(TemplateComponent, options.data);
    const html = await render(element);

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send email to ${options.to}`,
          error.message,
        );
        throw error;
      }

      this.logger.log(`Email sent to ${options.to} (template: ${options.template})`);
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${options.to}`,
        err instanceof Error ? err.message : String(err),
      );
      throw err;
    }
  }
}
