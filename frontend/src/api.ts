export interface Task { id: string; title: string; description: string; completed: boolean }
export type TaskInput = Omit<Task, 'id'>;
export async function request<T>(path = '', method = 'GET', body?: Partial<TaskInput>): Promise<T> {
  const response = await fetch(`http://localhost:3000/tasks${path}`, {
    method, headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`${response.status}: ${Array.isArray(error.message) ? error.message.join('; ') : error.message}`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
