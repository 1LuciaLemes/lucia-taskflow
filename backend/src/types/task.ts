export type {
  ApiErrorPayload,
  CreateTaskInput,
  EffortSummary,
  UpdateTaskInput,
} from '@task-system/shared';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}