import { MailerModule } from "@nestjs-modules/mailer";

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // REMOVE WHEN ON PROD
        const user = config.get("MAIL_USER");
        const pass = config.get("MAIL_PASSWORD");

        return {
          transport: {
            host: config.get("MAIL_HOST"),
            port: config.get("MAIL_PORT"),
            secure: false,
            // (mailho testing, remove mailhog creds in env and it won't cause an issue)
            ...(user && pass ? { auth: { user, pass } } : {}),
          },
          defaults: {
            from: config.get("MAIL_FROM"),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
