export class UserDeletedAdminNotificationEventDto {
  deletedUserId!: number;
  deletedUserName?: string | null;
  deletedUserEmail?: string | null;
  deletedUserRole?: string | null;
  companyId!: number;
  deletedByUserId?: number | null;
  deletedByUserName?: string | null;
}
