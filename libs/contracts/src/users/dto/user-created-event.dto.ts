export class UserCreatedEventDto {
  id!: number;
  bossId!: number | null;
  companyId!: number;
  email!: string;
  phone!: string | null;
}
