export class UserCreatedEventDto {
  id!: number;
  bossId!: number | null;
  companyId!: number;
<<<<<<< HEAD
  name?: string | null;
  lastName?: string | null;
  title?: string | null;
=======
  email!: string;
  phone!: string | null;
>>>>>>> 3b16702 (feat: enhance notifications module with email functionality and user event handling)
}
