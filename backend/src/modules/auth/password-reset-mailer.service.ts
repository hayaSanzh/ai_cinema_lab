import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

type PasswordResetEmail = {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
};

@Injectable()
export class PasswordResetMailer {
  private readonly logger = new Logger(PasswordResetMailer.name);
  private readonly transporter: Transporter | null;

  constructor() {
    this.transporter = this.createTransporter();
  }

  async sendPasswordResetEmail(input: PasswordResetEmail): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`SMTP is not configured. Password reset link for ${input.to}: ${input.resetUrl}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM ?? '"AI Cinema Lab" <no-reply@aicinemalab.local>',
        to: input.to,
        subject: 'Reset your AI Cinema Lab password',
        text: this.buildText(input),
        html: this.buildHtml(input),
      });
    } catch (error) {
      this.logger.error('Could not send password reset email.', error);
      throw new ServiceUnavailableException('Could not send password reset email.');
    }
  }

  private createTransporter(): Transporter | null {
    const host = process.env.SMTP_HOST;

    if (!host) {
      return null;
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    return nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  private buildText(input: PasswordResetEmail): string {
    return [
      `Hi ${input.name},`,
      '',
      'We received a request to reset your AI Cinema Lab password.',
      `Open this link within ${input.expiresInMinutes} minutes:`,
      input.resetUrl,
      '',
      'If you did not request this, you can ignore this email.',
    ].join('\n');
  }

  private buildHtml(input: PasswordResetEmail): string {
    return `
      <div style="font-family: Arial, sans-serif; color: #151515; line-height: 1.6;">
        <h2 style="margin: 0 0 16px;">Reset your AI Cinema Lab password</h2>
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${escapeHtml(input.resetUrl)}" style="display: inline-block; padding: 12px 18px; background: #d4ff00; color: #000; text-decoration: none; font-weight: 700; border-radius: 6px;">
            Reset password
          </a>
        </p>
        <p>This link expires in ${input.expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
