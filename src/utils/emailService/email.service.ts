import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // e.g., "smtp.gmail.com" or your SMTP server
      port: parseInt(process.env.EMAIL_PORT) || 587, // Default SMTP port
      secure: process.env.EMAIL_SECURE === 'true', // Use TLS
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
      to,
      subject,
      html, // Email content in HTML
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error;
    }
  }
}
