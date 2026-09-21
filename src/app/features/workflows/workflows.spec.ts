import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Workflows } from './workflows';

describe('Workflows', () => {
  let http: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workflows],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  function start() {
    const fixture = TestBed.createComponent(Workflows);
    fixture.detectChanges();
    http.expectOne('/api/health').flush({ status: 'ok' });
    return fixture;
  }

  it('shows loading and then the empty state', () => {
    const fixture = start();
    expect(fixture.nativeElement.textContent).toContain('Loading workflows');
    http.expectOne('/api/workflows').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Workflows');
    expect(fixture.nativeElement.textContent).toContain('No workflows yet');
  });

  it('validates whitespace without making a create request', () => {
    const fixture = start();
    http.expectOne('/api/workflows').flush([]);
    fixture.componentInstance.name = '   ';
    fixture.componentInstance.create();
    expect(fixture.componentInstance.formError()).toContain('Enter a name');
    http.expectNone((request) => request.method === 'POST');
  });

  it('prevents duplicate pending creates and reloads after a successful response', () => {
    const fixture = start();
    http.expectOne('/api/workflows').flush([]);
    const app = fixture.componentInstance;
    app.name = '  Example  ';
    app.create();
    app.create();
    expect(app.saving()).toBe(true);
    const request = http.expectOne('/api/workflows');
    expect(request.request.body).toEqual({ name: 'Example', description: null });
    const row = {
      id: '123',
      name: 'Example',
      description: null,
      createdAt: '2026-09-16T00:00:00Z',
      updatedAt: '2026-09-16T00:00:00Z',
    };
    request.flush(row, { status: 201, statusText: 'Created' });
    http.expectOne('/api/health').flush({ status: 'ok' });
    http.expectOne('/api/workflows').flush([row]);
    fixture.detectChanges();
    expect(app.saving()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Example');
  });

  it('shows API failures and preserves rejected form input', () => {
    const fixture = start();
    http.expectOne('/api/workflows').flush({}, { status: 503, statusText: 'Unavailable' });
    const app = fixture.componentInstance;
    app.name = 'Keep this';
    app.create();
    http.expectOne('/api/workflows').flush({}, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Could not load workflows');
    expect(fixture.nativeElement.textContent).toContain('API rejected');
    expect(app.name).toBe('Keep this');
    expect(app.saving()).toBe(false);
  });

  it('shows unavailable API feedback and retains input after a failed create', () => {
    const fixture = TestBed.createComponent(Workflows);
    fixture.detectChanges();
    http.expectOne('/api/health').error(new ProgressEvent('error'));
    http.expectOne('/api/workflows').error(new ProgressEvent('error'));
    const app = fixture.componentInstance;
    app.name = 'Retry me';
    app.description = 'Keep my description';
    app.create();
    http.expectOne('/api/workflows').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('API unavailable');
    expect(fixture.nativeElement.textContent).toContain('Your entries are kept');
    expect(app.name).toBe('Retry me');
    expect(app.description).toBe('Keep my description');
    expect(app.saving()).toBe(false);
  });

  it('validates field lengths before sending a request', () => {
    const fixture = start();
    http.expectOne('/api/workflows').flush([]);
    const app = fixture.componentInstance;
    app.name = 'x'.repeat(201);
    app.create();
    expect(app.formError()).toContain('Enter a name');
    app.name = 'Valid';
    app.description = 'x'.repeat(2001);
    app.create();
    expect(app.formError()).toContain('Enter a name');
    http.expectNone((request) => request.method === 'POST');
  });
});
