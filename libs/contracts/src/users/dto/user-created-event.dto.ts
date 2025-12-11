export class UserCreatedEventDto {
  id!: number;
  bossId!: number | null;
  companyId!: number;
  name?: string | null;
  lastName?: string | null;
  title?: string | null;
  email!: string;
  phone!: string | null;
}
