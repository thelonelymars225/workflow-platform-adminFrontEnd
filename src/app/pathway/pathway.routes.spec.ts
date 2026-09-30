import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './../app.routes';
import { PathwayJobs } from './data/pathway-jobs';
import { openRoute } from './testing/pathway-testing';

describe('Pathway routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('shows a not-found state for an unknown job', async () => {
    const { el } = await openRoute('/jobs/nope/check');
    expect(el().textContent).toContain('We could not find that job.');
  });

  it('keeps the primary action first in the footer on every step screen', async () => {
    const { harness, el } = await openRoute('/jobs/monthly-sales/set-up');
    for (const page of ['set-up', 'check', 'done']) {
      if (page === 'done') TestBed.inject(PathwayJobs).send('monthly-sales');
      await harness.navigateByUrl(`/jobs/monthly-sales/${page}`);
      const first = el().querySelector('pw-action-bar')!.firstElementChild!;
      expect(first.getAttribute('data-variant')).toBe('primary');
    }
  });
});
