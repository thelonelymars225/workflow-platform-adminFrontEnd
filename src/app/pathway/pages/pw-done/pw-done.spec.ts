import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { PathwayJobs } from '../../data/pathway-jobs';
import { openRoute } from '../../testing/pathway-testing';

describe('Done', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Done: every step done, and the timestamped record', async () => {
    TestBed.inject(PathwayJobs).send('monthly-sales');
    const { el } = await openRoute('/jobs/monthly-sales/done');
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
    const { el } = await openRoute('/jobs/budget-approval/done');
    expect(el().textContent).toContain('This has not been sent yet.');
    expect(el().textContent).toContain('Check it now');
  });
});
