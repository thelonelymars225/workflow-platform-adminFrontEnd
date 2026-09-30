import { RouterTestingHarness } from '@angular/router/testing';
import { PathStep } from '../shared/pw-pathway/pw-pathway';

/** Opens a route in a test harness, with helpers for settling and finding buttons by text. */
export async function openRoute(url: string) {
  const harness = await RouterTestingHarness.create(url);
  const el = () => harness.fixture.nativeElement as HTMLElement;
  const settle = async () => {
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness.detectChanges();
  };
  const button = (text: string) =>
    Array.from(el().querySelectorAll<HTMLElement>('button, a')).find(
      (b) => b.textContent?.trim() === text,
    )!;
  return { harness, el, settle, button };
}

export const SAMPLE_STEPS: PathStep[] = [
  {
    type: 'get',
    title: 'Sales spreadsheet',
    detail: 'Google Drive',
    status: { kind: 'done', label: 'Done' },
  },
  { type: 'make', title: 'Short report', detail: 'PDF' },
  {
    type: 'check',
    title: 'You',
    detail: 'Before sending',
    status: { kind: 'waiting', label: 'Your turn' },
  },
  { type: 'send', title: 'Team leads', detail: 'By email' },
];
