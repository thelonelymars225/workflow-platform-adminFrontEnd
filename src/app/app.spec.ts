import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { PreviewStore, PREVIEW_STORAGE_KEY } from './preview/preview-store';

// These exercise routed forms/state. Existing API contract tests remain in features/workflows.
describe('Atlas task journeys', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });
  afterEach(() => localStorage.clear());

  it('opens the home page and routes to all three guided task types', async () => {
    const harness = await RouterTestingHarness.create('/start');
    expect(harness.routeNativeElement?.textContent).toContain(
      'What would you like help with today?',
    );
    expect(harness.routeNativeElement?.querySelectorAll('.task-card').length).toBe(3);
    const store = TestBed.inject(PreviewStore);
    for (const kind of ['report', 'update', 'approval'] as const) {
      const task = store.create(kind);
      await harness.navigateByUrl(`/tasks/${task.id}/setup`);
      expect(harness.routeNativeElement?.querySelectorAll('.step').length).toBe(3);
    }
  });

  it('retains edited form values when moving to review and back', async () => {
    const harness = await RouterTestingHarness.create('/tasks/report/setup');
    // Resolve the active routed page, beneath the workspace shell.
    const page = TestBed.inject(PreviewStore);
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#document')!;
    input.value = 'October actuals.xlsx';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness
      .routeNativeElement!.querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(page.tasks().find((t) => t.id === 'report')?.document).toBe('October actuals.xlsx');
    expect(harness.routeNativeElement?.textContent).toContain('Take a look before you share.');
    await harness.navigateByUrl('/tasks/report/setup');
    expect(harness.routeNativeElement!.querySelector<HTMLInputElement>('#document')!.value).toBe(
      'October actuals.xlsx',
    );
  });

  it('keeps an incomplete setup on the form with an actionable error', async () => {
    const harness = await RouterTestingHarness.create('/tasks/finance/setup');
    const input = harness.routeNativeElement!.querySelector<HTMLInputElement>('#document')!;
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness
      .routeNativeElement!.querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'complete the highlighted fields',
    );
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(
      TestBed.inject(PreviewStore)
        .tasks()
        .find((t) => t.id === 'finance')?.status,
    ).toBe('draft');
  });

  it('shows a confirmation for update and approval previews without implying delivery', async () => {
    const harness = await RouterTestingHarness.create('/start');
    const store = TestBed.inject(PreviewStore);
    for (const kind of ['update', 'approval'] as const) {
      const task = store.create(kind);
      store.save({ ...task, status: 'review' });
      await harness.navigateByUrl(`/tasks/${task.id}/review`);
      const label = kind === 'update' ? 'Turn on weekly update' : 'Send approval request';
      const button = Array.from(
        harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('button'),
      ).find((b) => b.textContent?.trim() === label)!;
      const dialog = Array.from(
        harness.routeNativeElement!.querySelectorAll<HTMLDialogElement>('dialog'),
      ).find((d) => d.getAttribute('aria-label')?.includes('preview'))!;
      // jsdom lacks showModal. This tests wiring/content; native focus and Escape remain browser checks.
      const showModal = vi.fn(() => dialog.setAttribute('open', ''));
      Object.defineProperty(dialog, 'showModal', { value: showModal, configurable: true });
      button.click();
      harness.detectChanges();
      expect(showModal).toHaveBeenCalledOnce();
      expect(harness.routeNativeElement!.querySelector('dialog[open]')?.textContent).toContain(
        'Nothing was scheduled or sent.',
      );
      expect(store.tasks().find((t) => t.id === task.id)?.status).toBe(
        kind === 'update' ? 'scheduled' : 'waiting',
      );
    }
  });

  it('requires review before completing and never completes an unknown task', async () => {
    const harness = await RouterTestingHarness.create('/tasks/finance/complete');
    expect(harness.routeNativeElement?.textContent).toContain('Review this task first.');
    await harness.navigateByUrl('/tasks/missing/review');
    expect(harness.routeNativeElement?.textContent).toContain('Let’s get you back on track.');
    await harness.navigateByUrl('/tasks/report/review');
    const button = Array.from(
      harness.routeNativeElement!.querySelectorAll<HTMLButtonElement>('button'),
    ).find((b) => b.textContent?.includes('Approve & send'))!;
    button.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Your report preview is complete.');
    expect(harness.routeNativeElement?.textContent).toContain('Nothing was sent');
    const stored = JSON.parse(localStorage.getItem(PREVIEW_STORAGE_KEY)!);
    expect(stored.tasks.find((t: { id: string }) => t.id === 'report').status).toBe('complete');
  });
});
