import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { PrismaService } from "./prisma.service";

export interface PrismaModuleOptions {
  provide?: symbol | string;
  client?: Type;
  databaseUrlEnv?: string;
  global?: boolean;
}

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PrismaModule {
  static forRoot(options?: PrismaModuleOptions): DynamicModule {
    const providers: Provider[] = [];

    if (options?.provide !== undefined && options.client !== undefined) {
      // Custom Prisma client with specific database
      providers.push({
        provide: options.provide,
        useFactory: () => {
          const databaseUrl =
            options.databaseUrlEnv !== undefined &&
            process.env[options.databaseUrlEnv] !== undefined
              ? process.env[options.databaseUrlEnv]
              : process.env.DATABASE_URL;

          const ClientConstructor = options.client as unknown as new (
            config: unknown,
          ) => unknown;
          return new ClientConstructor({
            datasources: {
              db: {
                url: databaseUrl,
              },
            },
          });
        },
      });
    } else {
      // Default PrismaService
      providers.push(PrismaService);
    }

    return {
      module: PrismaModule,
      imports: [ConfigModule.forRoot()],
      providers,
      exports: providers,
      global: options?.global ?? false,
    };
  }
}
