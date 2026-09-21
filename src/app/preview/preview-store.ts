import { afterNextRender, Injectable, signal } from '@angular/core';
import {
  CONNECTIONS,
  DEFAULT_PREFERENCES,
  Member,
  newTask,
  Preferences,
  PreviewTask,
  sampleTasks,
  SAMPLE_MEMBERS,
  TaskKind,
  TaskStatus,
  TASK_KINDS,
} from './preview-data';

export const PREVIEW_STORAGE_KEY = 'workflow.atlas-preview.v1';
interface Snapshot {
  version: 1;
  tasks: PreviewTask[];
  preferences: Preferences;
  members: Member[];
  connections: Record<string, string>;
}
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const shortText = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 500;
const statuses: TaskStatus[] = ['draft', 'review', 'scheduled', 'complete', 'waiting'];

// localStorage is untrusted; an old or malformed preview must never break navigation.
export function parseSnapshot(raw: string): Snapshot | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data['version'] !== 1) return null;
    const tasks = data['tasks'],
      preferences = data['preferences'],
      members = data['members'],
      connections = data['connections'];
    if (
      !Array.isArray(tasks) ||
      tasks.length > 200 ||
      !tasks.every(
        (t) =>
          isRecord(t) &&
          [
            'id',
            'kind',
            'name',
            'source',
            'document',
            'output',
            'period',
            'recipient',
            'schedule',
            'dueDate',
            'status',
          ].every((k) => shortText(t[k])) &&
          TASK_KINDS.includes(t['kind'] as TaskKind) &&
          statuses.includes(t['status'] as TaskStatus) &&
          /^[a-zA-Z0-9-]+$/.test(t['id'] as string),
      )
    )
      return null;
    if (new Set(tasks.map((t) => t.id)).size !== tasks.length) return null;
    if (
      !isRecord(preferences) ||
      !['workspace', 'displayName', 'timezone'].every((k) => shortText(preferences[k])) ||
      typeof preferences['reminders'] !== 'boolean'
    )
      return null;
    if (
      !Array.isArray(members) ||
      members.length > 200 ||
      !members.every(
        (m) => isRecord(m) && ['name', 'email', 'role', 'status'].every((k) => shortText(m[k])),
      )
    )
      return null;
    if (!isRecord(connections) || !CONNECTIONS.every((c) => shortText(connections[c.id])))
      return null;
    return data as unknown as Snapshot;
  } catch {
    return null;
  }
}

/** Explicit frontend preview state. Never used as authentication or authorization. */
@Injectable({ providedIn: 'root' })
export class PreviewStore {
  private readonly taskState = signal(sampleTasks());
  private readonly preferenceState = signal({ ...DEFAULT_PREFERENCES });
  private readonly memberState = signal(SAMPLE_MEMBERS.map((m) => ({ ...m })));
  private readonly connectionState = signal<Record<string, string>>(
    Object.fromEntries(CONNECTIONS.map((c) => [c.id, c.status])),
  );
  readonly tasks = this.taskState.asReadonly();
  readonly preferences = this.preferenceState.asReadonly();
  readonly members = this.memberState.asReadonly();
  readonly connections = this.connectionState.asReadonly();
  readonly storageNotice = signal('');
  readonly ready = signal(false);
  constructor() {
    afterNextRender(() => {
      try {
        const raw = localStorage.getItem(PREVIEW_STORAGE_KEY);
        const saved = raw ? parseSnapshot(raw) : null;
        if (saved) {
          this.taskState.set(saved.tasks);
          this.preferenceState.set(saved.preferences);
          this.memberState.set(saved.members);
          this.connectionState.set(saved.connections);
        } else if (raw)
          this.storageNotice.set(
            'This saved preview could not be opened. The sample workspace is ready to explore.',
          );
      } catch {
        this.storageNotice.set(
          'Your browser cannot save this preview. Changes will last until this page closes.',
        );
      }
      this.ready.set(true);
    });
  }
  create(kind: TaskKind): PreviewTask {
    const task = newTask(kind, crypto.randomUUID());
    this.taskState.update((tasks) => [...tasks, task]);
    this.persist();
    return task;
  }
  save(task: PreviewTask) {
    this.taskState.update((tasks) => tasks.map((t) => (t.id === task.id ? { ...task } : t)));
    this.persist();
  }
  setPreferences(preferences: Preferences) {
    this.preferenceState.set({ ...preferences });
    this.persist();
  }
  invite(email: string, role: string): boolean {
    if (this.members().some((m) => m.email.toLowerCase() === email.toLowerCase())) return false;
    this.memberState.update((members) => [
      ...members,
      { name: email.split('@')[0], email, role, status: 'Invitation preview' },
    ]);
    this.persist();
    return true;
  }
  connect(id: string) {
    if (!CONNECTIONS.some((c) => c.id === id)) return;
    this.connectionState.update((values) => ({ ...values, [id]: 'Connected' }));
    this.persist();
  }
  private persist() {
    if (!this.ready()) return;
    try {
      localStorage.setItem(
        PREVIEW_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          tasks: this.tasks(),
          preferences: this.preferences(),
          members: this.members(),
          connections: this.connections(),
        } satisfies Snapshot),
      );
      this.storageNotice.set('');
    } catch {
      this.storageNotice.set(
        'Your changes are here for this visit, but this browser could not save them for next time.',
      );
    }
  }
}
