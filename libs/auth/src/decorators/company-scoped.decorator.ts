import { SetMetadata } from "@nestjs/common";

export const COMPANY_SCOPED_KEY = Symbol("COMPANY_SCOPED_METADATA");

export type CompanyScopedSource = "body" | "params" | "query";

export interface CompanyScopedOptions {
  source?: CompanyScopedSource;
  propertyPath?: string;
}

export const CompanyScoped = (options?: CompanyScopedOptions) =>
  SetMetadata(
    COMPANY_SCOPED_KEY,
    options ?? ({} satisfies CompanyScopedOptions),
  );
