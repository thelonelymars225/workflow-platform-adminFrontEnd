import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { PathwayJobs } from '../../data/pathway-jobs';
import { openRoute } from '../../testing/pathway-testing';

describe('Set up', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Set up: editing a step updates its tile', async () => {
    const { el, settle, button } = await openRoute('/pathway/jobs/monthly-sales/set-up');
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
    const { el, settle, button } = await openRoute('/pathway/jobs/monthly-sales/set-up');
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
    const { el, settle, button } = await openRoute(`/pathway/jobs/${job.id}/set-up`);
    button('Next: check the plan').click();
    await settle();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain(
      'Choose the Get, Make, Send step first.',
    );
    expect(TestBed.inject(PathwayJobs).job(job.id)?.stage).toBe('setup');
  });
});
