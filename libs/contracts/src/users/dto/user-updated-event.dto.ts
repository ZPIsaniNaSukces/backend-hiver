export class UserUpdatedEventDto {
  id!: number;
  bossId?: number | null;
  companyId?: number;
  name?: string | null;
  lastName?: string | null;
  title?: string | null;
}
