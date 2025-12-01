export class UserUpdatedEventDto {
  id!: number;
  bossId?: number | null;
  companyId?: number;
  email?: string;
  phone?: string | null;
}
