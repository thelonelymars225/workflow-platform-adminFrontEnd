import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { PathwayJobs } from '../../data/pathway-jobs';
import { openRoute } from '../../testing/pathway-testing';

describe('Home', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Home (waiting): groups jobs, shows mini pathways, statuses and actions', async () => {
    const { el } = await openRoute('/');
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
    const { el } = await openRoute('/');
    expect(el().textContent).toContain('You have no jobs yet.');
    expect(el().querySelectorAll('article').length).toBe(0);
  });

  it('Home: "Start a new job" opens Set up for a new job', async () => {
    const { harness, settle, button } = await openRoute('/');
    button('+ Start a new job').click();
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Step 1 of 3 · Set up');
  });
});
