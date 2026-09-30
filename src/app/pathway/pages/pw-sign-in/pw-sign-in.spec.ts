import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../../app.routes';
import { PathwayJobs } from '../../data/pathway-jobs';
import { openRoute } from '../../testing/pathway-testing';

describe('Sign in', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  it('Sign in: explainer tiles, labelled field, and an error for an empty email', async () => {
    const { el, settle, button } = await openRoute('/pathway/sign-in');
    expect(el().textContent).toContain('Every job is four steps.');
    expect(el().querySelectorAll('pw-tile').length).toBe(4);
    expect(el().querySelector('label')?.textContent?.trim()).toBe('Work email');
    button('Continue').click();
    await settle();
    expect(el().textContent).toContain('Enter your work email');
    expect(el().querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
  });

  it('Sign in: a valid email continues to Home', async () => {
    const { harness, el, settle, button } = await openRoute('/pathway/sign-in');
    const input = el().querySelector<HTMLInputElement>('input')!;
    input.value = 'mars@company.com';
    input.dispatchEvent(new Event('input'));
    button('Continue').click();
    await settle();
    expect(TestBed.inject(PathwayJobs)).toBeTruthy();
    expect(harness.routeNativeElement?.textContent).toContain('Good morning, Lonely Mars.');
  });
});
