import { getSessionId } from '../utils/sessionContext.js';
import type { Task } from '../models/task.js';
import type { UpdateTaskInput } from '../types/task.js';
import { InMemoryTaskRepository } from './inMemoryTaskRepository.js';
import type { TaskRepository } from './taskRepository.js';

const DEFAULT_SESSION = '__anonymous__';
const MAX_SESSIONS = 500;

export class SessionTaskRepository implements TaskRepository {
  private readonly sessions = new Map<string, InMemoryTaskRepository>();

  async insert(task: Task): Promise<Task> {
    return this.current().insert(task);
  }

  async findById(id: string): Promise<Task | null> {
    return this.current().findById(id);
  }

  async findAll(): Promise<Task[]> {
    return this.current().findAll();
  }

  async findByParentId(parentId: string | null): Promise<Task[]> {
    return this.current().findByParentId(parentId);
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task | null> {
    return this.current().update(id, input);
  }

  async delete(id: string): Promise<void> {
    return this.current().delete(id);
  }

  private current(): InMemoryTaskRepository {
    const sessionId = getSessionId() ?? DEFAULT_SESSION;
    const existing = this.sessions.get(sessionId);
    if (existing) {
      return existing;
    }

    if (this.sessions.size >= MAX_SESSIONS) {
      const oldest = this.sessions.keys().next().value;
      if (oldest !== undefined) {
        this.sessions.delete(oldest);
      }
    }

    const repository = new InMemoryTaskRepository();
    this.sessions.set(sessionId, repository);
    return repository;
  }
}
