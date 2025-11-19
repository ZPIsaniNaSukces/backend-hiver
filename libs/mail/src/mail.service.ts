import { MailerService } from "@nestjs-modules/mailer";
import { readFileSync } from "node:fs";
import path from "node:path";

import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(
    email: string,
    temporaryPassword: string,
  ): Promise<void> {
    try {
      this.logger.log(`Attempting to send welcome email to ${email}`);
      const template = this.loadTemplate("welcome-email.html");
      const html = this.interpolateTemplate(template, {
        email,
        temporaryPassword,
        year: new Date().getFullYear().toString(),
      });

      this.logger.debug(
        `Sending email to ${email} with subject "Welcome to HiveR!"`,
      );
      await this.mailerService.sendMail({
        to: email,
        subject: "Welcome to HiveR!",
        html,
      });

      this.logger.log(`Welcome email successfully sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      throw error;
    }
  }

  //this is for the future and it is not tested yet
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    try {
      this.logger.log(`Attempting to send password reset email to ${email}`);
      const template = this.loadTemplate("password-reset-email.html");
      const html = this.interpolateTemplate(template, {
        resetToken,
        year: new Date().getFullYear().toString(),
      });

      await this.mailerService.sendMail({
        to: email,
        subject: "Password Reset Request",
        html,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error,
      );
      throw error;
    }
  }

  private loadTemplate(name: string): string {
    const templatePath = path.join(
      process.cwd(),
      "libs",
      "mail",
      "src",
      "templates",
      name,
    );
    return readFileSync(templatePath, "utf8");
  }

  private interpolateTemplate(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{{${key}}}`, value);
    }
    return result;
  }
}
