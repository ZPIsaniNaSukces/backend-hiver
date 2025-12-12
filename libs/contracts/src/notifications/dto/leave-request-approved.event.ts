export class LeaveRequestApprovedEventDto {
  userId!: number;
  userName?: string | null;
  userEmail!: string | null;
  startsAt!: Date;
  endsAt!: Date;
  reason?: string | null;
  approverName?: string | null;
}
