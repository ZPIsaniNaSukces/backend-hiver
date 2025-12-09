export class UserCreatedNotificationEventDto {
  id!: number;
  email!: string | null;
  phone!: string | null;
  companyId!: number;
}

export class UserUpdatedNotificationEventDto {
  id!: number;
  email?: string | null;
  phone?: string | null;
  companyId?: number;
}

export class UserRemovedNotificationEventDto {
  id!: number;
}
