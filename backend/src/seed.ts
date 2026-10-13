import { TaskPriority, TaskStatus } from './models/task.js';
import type { TaskService } from './services/taskService.js';
import type { CreateTaskInput } from './types/task.js';

interface SeedTask extends CreateTaskInput {
  subtasks?: SeedTask[];
}

const DEMO_TASKS: SeedTask[] = [
  {
    title: 'Publicar el portfolio',
    description: 'Dejar el sitio en línea con los proyectos y el contacto',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    estimate: 8,
    subtasks: [
      {
        title: 'Escribir el README',
        priority: TaskPriority.MEDIUM,
        estimate: 3,
        status: TaskStatus.COMPLETE,
      },
      {
        title: 'Desplegar frontend y backend',
        priority: TaskPriority.HIGH,
        estimate: 4,
      },
    ],
  },
  {
    title: 'Estudiar TypeScript',
    priority: TaskPriority.MEDIUM,
    estimate: 10,
    subtasks: [
      { title: 'Genéricos', status: TaskStatus.IN_PROGRESS, estimate: 4 },
      { title: 'Utility types', estimate: 2 },
    ],
  },
  {
    title: 'Organizar la semana',
    description: 'Cargar las tareas de la semana en el tablero',
    status: TaskStatus.PENDING,
    priority: TaskPriority.LOW,
    estimate: 2,
  },
];

async function createTree(
  service: TaskService,
  tasks: SeedTask[],
  parentTaskId: string | null,
): Promise<void> {
  for (const { subtasks, ...input } of tasks) {
    const created = await service.createTask({ ...input, parentTaskId });
    if (subtasks) {
      await createTree(service, subtasks, created.id);
    }
  }
}

export async function seedDemoData(service: TaskService): Promise<void> {
  await createTree(service, DEMO_TASKS, null);
}
