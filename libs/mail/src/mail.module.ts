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
        const user = config.get<string>("MAIL_USER");
        const pass = config.get<string>("MAIL_PASSWORD");

        return {
          transport: {
            host: config.get<string>("MAIL_HOST"),
            port: config.get<number>("MAIL_PORT"),
            secure: false,
            // (mailho testing, remove mailhog creds in env and it won't cause an issue)
            ...(typeof user === "string" && typeof pass === "string"
              ? { auth: { user, pass } }
              : {}),
          },
          defaults: {
            from: config.get<string>("MAIL_FROM"),
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
