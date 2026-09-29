import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../app.routes';
import { PathwayJobs } from './pathway-jobs';

async function open(url: string) {
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

describe('Pathway screens', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Sign in: explainer tiles, labelled field, and an error for an empty email', async () => {
    const { el, settle, button } = await open('/pathway/sign-in');
    expect(el().textContent).toContain('Every job is four steps.');
    expect(el().querySelectorAll('pw-tile').length).toBe(4);
    expect(el().querySelector('label')?.textContent?.trim()).toBe('Work email');
    button('Continue').click();
    await settle();
    expect(el().textContent).toContain('Enter your work email');
    expect(el().querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('Sign in: a valid email continues to Home', async () => {
    const { harness, el, settle, button } = await open('/pathway/sign-in');
    const input = el().querySelector<HTMLInputElement>('input')!;
    input.value = 'mars@company.com';
    input.dispatchEvent(new Event('input'));
    button('Continue').click();
    await settle();
    expect(TestBed.inject(PathwayJobs)).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).toContain('Good morning, Lonely Mars.');
  });

  it('Home (waiting): groups jobs, shows mini pathways, statuses and actions', async () => {
    const { el } = await open('/pathway');
    const sections = el().querySelectorAll('section[aria-label]');
    expect(sections[0].textContent).toContain('Needs you');
    expect(sections[0].textContent).toContain('Monthly sales report');
    expect(sections[0].textContent).toContain('Ready for you to check');
    expect(sections[0].textContent).toContain('Check it');
    expect(sections[1].textContent).toContain('Running on their own');
    expect(sections[1].querySelectorAll('article').length).toBe(2);
    expect(el().querySelectorAll('pw-mini-pathway').length).toBe(3);
    expect(el().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Home');
  });

  it('Home (empty): explains there are no jobs yet', async () => {
    TestBed.inject(PathwayJobs).load([]);
    const { el } = await open('/pathway');
    expect(el().textContent).toContain('You have no jobs yet.');
    expect(el().querySelectorAll('article').length).toBe(0);
  });

  it('Home: "Start a new job" opens Set up for a new job', async () => {
    const { harness, settle, button } = await open('/pathway');
    button('+ Start a new job').click();
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Step 1 of 3 · Set up');
  });

  it('Set up: editing a step updates its tile', async () => {
    const { el, settle, button } = await open('/pathway/jobs/monthly-sales/set-up');
    expect(el().textContent).toContain('You are changing the Get step');
    el().querySelector<HTMLButtonElement>('#pw-tile-make')!.click();
    await settle();
    expect(el().textContent).toContain('You are changing the Make step');
    const inputs = el().querySelectorAll<HTMLInputElement>('form pw-field input');
    expect(inputs[0].value).toBe('Short report');
    inputs[0].value = 'Slide deck';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'Five slides';
    inputs[1].dispatchEvent(new Event('input'));
    button('Save this step').click();
    await settle();
    const tile = el().querySelector('#pw-tile-make')!;
    expect(tile.textContent).toContain('Slide deck');
    expect(tile.textContent).toContain('Five slides');
    expect(el().textContent).not.toContain('You are changing');
    expect(el().querySelector('[role="status"]')?.textContent).toContain('Make step saved.');
  });

  it('Set up: "Close without saving" keeps the tile as it was', async () => {
    const { el, settle, button } = await open('/pathway/jobs/monthly-sales/set-up');
    const input = el().querySelector<HTMLInputElement>('form pw-field input')!;
    input.value = 'Dropbox';
    input.dispatchEvent(new Event('input'));
    button('Close without saving').click();
    await settle();
    expect(el().querySelector('#pw-tile-get')!.textContent).toContain(
      'Google Drive · Finance folder',
    );
  });

  it('Set up (empty new job): asks for the missing steps before moving on', async () => {
    const job = TestBed.inject(PathwayJobs).create();
    const { el, settle, button } = await open(`/pathway/jobs/${job.id}/set-up`);
    button('Next: check the plan').click();
    await settle();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain(
      'Choose the Get, Make, Send step first.',
    );
    expect(TestBed.inject(PathwayJobs).job(job.id)?.stage).toBe('setup');
  });

  it('Check (waiting): statuses, preview, cards and send confirmation', async () => {
    const { harness, el, settle, button } = await open('/pathway/jobs/monthly-sales/check');
    expect(el().textContent).toContain('Take a look before it goes.');
    expect(
      Array.from(el().querySelectorAll('pw-pathway pw-status')).map((s) => s.textContent?.trim()),
    ).toEqual(['Done', 'Done', 'Your turn']);
    expect(el().textContent).toContain('Sales held steady in September.');
    expect(el().textContent).toContain('Who gets it');
    expect(el().textContent).toContain('What was read');
    expect(el().textContent).toContain('This sends the report to 3 people.');
    button('Looks good, send it').click();
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Your report was sent.');
  });

  it('Check (empty): nothing to check while a job is being set up', async () => {
    const job = TestBed.inject(PathwayJobs).create();
    const { el } = await open(`/pathway/jobs/${job.id}/check`);
    expect(el().textContent).toContain('There is nothing to check yet.');
    expect(el().textContent).not.toContain('Looks good, send it');
  });

  it('Done: every step done, and the timestamped record', async () => {
    TestBed.inject(PathwayJobs).send('monthly-sales');
    const { el } = await open('/pathway/jobs/monthly-sales/done');
    expect(el().textContent).toContain('Step 3 of 3 · Done');
    expect(
      Array.from(el().querySelectorAll('pw-pathway pw-status')).map((s) => s.textContent?.trim()),
    ).toEqual(['Done', 'Done', 'Done', 'Sent']);
    expect(el().querySelector('#pw-main')).not.toBeNull();
    expect(el().textContent).toContain('Checked at 09:31');
    const rows = el().querySelectorAll('ol li time');
    expect(Array.from(rows).map((t) => t.textContent)).toEqual(['09:30', '09:30', '09:32']);
  });

  it('Done (waiting): says nothing has been sent until it is checked', async () => {
    const { el } = await open('/pathway/jobs/budget-approval/done');
    expect(el().textContent).toContain('This has not been sent yet.');
    expect(el().textContent).toContain('Check it now');
  });

  it('shows a not-found state for an unknown job', async () => {
    const { el } = await open('/pathway/jobs/nope/check');
    expect(el().textContent).toContain('We could not find that job.');
  });

  it('keeps the primary action first in the footer on every step screen', async () => {
    const { harness, el } = await open('/pathway/jobs/monthly-sales/set-up');
    for (const page of ['set-up', 'check', 'done']) {
      if (page === 'done') TestBed.inject(PathwayJobs).send('monthly-sales');
      await harness.navigateByUrl(`/pathway/jobs/monthly-sales/${page}`);
      const first = el().querySelector('pw-action-bar')!.firstElementChild!;
      expect(first.className).toContain('bg-pw-accent');
    }
  });
});
