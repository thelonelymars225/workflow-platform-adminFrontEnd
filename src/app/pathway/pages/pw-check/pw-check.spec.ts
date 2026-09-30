import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { PathwayJobs } from '../../data/pathway-jobs';
import { openRoute } from '../../testing/pathway-testing';

describe('Check', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Check (waiting): statuses, preview, cards and send confirmation', async () => {
    const { harness, el, settle, button } = await openRoute('/pathway/jobs/monthly-sales/check');
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
    const { el } = await openRoute(`/pathway/jobs/${job.id}/check`);
    expect(el().textContent).toContain('There is nothing to check yet.');
    expect(el().textContent).not.toContain('Looks good, send it');
  });
});
