export class TaskAssignedEventDto {
  taskId!: number;
  taskTitle!: string;
  taskDescription?: string | null;
  assigneeId!: number;
  assigneeEmail!: string | null;
  assigneeName?: string | null;
  reporterName?: string | null;
  dueDate?: Date | null;
}
