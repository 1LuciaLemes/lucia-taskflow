import type { TaskBase } from '@task-system/shared';

export { TaskKind, TaskPriority, TaskStatus } from '@task-system/shared';

export interface Task extends TaskBase {
  createdAt: Date;
  updatedAt: Date;
}