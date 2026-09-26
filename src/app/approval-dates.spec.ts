import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { newTask } from './preview/preview-data';
import { PreviewStore } from './preview/preview-store';

describe('Approval due dates', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 26, 12));
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it.each([
    [new Date(2026, 8, 26, 0, 30), '2026-10-03'],
    [new Date(2026, 11, 28, 23, 30), '2027-01-04'],
    [new Date(2028, 1, 25, 12), '2028-03-03'],
  ])('defaults to seven local calendar days ahead of %s', (now, expected) => {
    vi.setSystemTime(now);
    expect(newTask('approval', 'new-approval').dueDate).toBe(expected);
  });

  async function openApproval(dueDate: string, page: 'setup' | 'review') {
    const harness = await RouterTestingHarness.create('/start');
    const store = TestBed.inject(PreviewStore);
    const task = store.create('approval');
    store.save({ ...task, dueDate, status: page === 'review' ? 'review' : 'draft' });
    await harness.navigateByUrl(`/tasks/${task.id}/${page}`);
    return { harness, store, id: task.id };
  }

  async function submitSetup(harness: RouterTestingHarness) {
    harness
      .routeNativeElement!.querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    harness.detectChanges();
  }

  function confirmButton(harness: RouterTestingHarness) {
    return Array.from(
      harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.trim() === 'Send approval request')!;
  }

  it('rejects an expired setup and allows correcting it to today', async () => {
    const { harness, store, id } = await openApproval('2026-09-24', 'setup');
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#due-date')!;
    expect(input.min).toBe('2026-09-26');
    await submitSetup(harness);
    expect(store.tasks().find((task) => task.id === id)?.status).toBe('draft');
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'Choose a due date today or later',
    );
    expect(input.getAttribute('aria-invalid')).toBe('true');

    input.value = '2026-09-26';
    input.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    await submitSetup(harness);
    expect(store.tasks().find((task) => task.id === id)?.status).toBe('review');
    expect(confirmButton(harness).disabled).toBe(false);
    expect(harness.routeNativeElement?.textContent).toContain('26 September 2026');
  });

  it('blocks an expired saved review opened directly', async () => {
    const { harness, store, id } = await openApproval('2026-09-24', 'review');
    expect(confirmButton(harness).disabled).toBe(true);
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'due date has passed',
    );
    confirmButton(harness).click();
    expect(store.tasks().find((task) => task.id === id)?.status).toBe('review');
    expect(harness.routeNativeElement!.querySelector('dialog[open]')).toBeNull();
  });

  it('rechecks the date when setup is submitted after midnight', async () => {
    const { harness, store, id } = await openApproval('2026-09-26', 'setup');
    vi.setSystemTime(new Date(2026, 8, 27, 0, 1));
    await submitSetup(harness);
    expect(store.tasks().find((task) => task.id === id)?.status).toBe('draft');
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'Choose a due date today or later',
    );
  });

  it('rechecks the date before confirming a review left open overnight', async () => {
    const { harness, store, id } = await openApproval('2026-09-26', 'review');
    const button = confirmButton(harness);
    expect(button.disabled).toBe(false);
    const showModal = vi.fn();
    const dialog = harness.routeNativeElement!.querySelector('dialog')!;
    Object.defineProperty(dialog, 'showModal', { value: showModal, configurable: true });
    // Click before another render: the handler must guard a stale enabled button too.
    vi.setSystemTime(new Date(2026, 8, 27, 0, 1));
    button.click();
    harness.detectChanges();
    expect(store.tasks().find((task) => task.id === id)?.status).toBe('review');
    expect(button.disabled).toBe(true);
    expect(showModal).not.toHaveBeenCalled();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'due date has passed',
    );
  });
});
