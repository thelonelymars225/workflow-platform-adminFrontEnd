import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CONNECTIONS, DEFAULT_PREFERENCES, sampleTasks, SAMPLE_MEMBERS } from './preview-data';
import { parseSnapshot, PREVIEW_STORAGE_KEY, PreviewStore } from './preview-store';

@Component({ template: '' })
class StoreHost {
  readonly store = inject(PreviewStore);
}
const snapshot = () => ({
  version: 1,
  tasks: sampleTasks(),
  preferences: { ...DEFAULT_PREFERENCES },
  members: SAMPLE_MEMBERS,
  connections: Object.fromEntries(CONNECTIONS.map((c) => [c.id, c.status])),
});

describe('Atlas preview persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [StoreHost] });
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });
  it('rejects corrupt or outdated state without throwing', () => {
    for (const raw of [
      'broken',
      'null',
      '{}',
      JSON.stringify({ ...snapshot(), version: 9 }),
      JSON.stringify({ ...snapshot(), tasks: [{ id: '../../foo' }] }),
      JSON.stringify({ ...snapshot(), tasks: [sampleTasks()[0], sampleTasks()[0]] }),
    ])
      expect(parseSnapshot(raw)).toBeNull();
  });
  it('restores drafts and preferences after a page reload', () => {
    const data = snapshot();
    data.tasks[0].document = 'Retained.xlsx';
    data.tasks[0].status = 'draft';
    data.preferences.workspace = 'Finance workspace';
    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(data));
    const fixture = TestBed.createComponent(StoreHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.store.tasks()[0].document).toBe('Retained.xlsx');
    expect(fixture.componentInstance.store.preferences().workspace).toBe('Finance workspace');
  });
  it('keeps the current draft and explains when browser storage fails', () => {
    const fixture = TestBed.createComponent(StoreHost);
    fixture.detectChanges();
    const store = fixture.componentInstance.store;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    store.save({ ...store.tasks()[0], document: 'Keep this.xlsx' });
    expect(store.tasks()[0].document).toBe('Keep this.xlsx');
    expect(store.storageNotice()).toContain('could not save');
  });
  it('rejects duplicate invitation previews case-insensitively', () => {
    const fixture = TestBed.createComponent(StoreHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.store.invite('SARA@example.com', 'Viewer')).toBe(false);
    expect(fixture.componentInstance.store.members()).toHaveLength(4);
  });
});
