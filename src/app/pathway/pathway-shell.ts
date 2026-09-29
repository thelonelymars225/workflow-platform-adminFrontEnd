import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PathwayJobs } from './pathway-jobs';
import { PwHelpDialog } from './shared/pw-help-dialog';
import { PwSection, PwTopBar } from './shared/pw-top-bar';

/** Layout for every signed-in Pathway screen: top bar, page, help dialog. */
@Component({
  selector: 'pw-shell',
  imports: [RouterOutlet, PwTopBar, PwHelpDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col bg-pw-bg font-pathway text-pw-ink' },
  template: `
    <a
      href="#pw-main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-pw-field focus:bg-pw-surface focus:p-4 focus:text-pw-body"
      >Skip to main content</a
    >
    <pw-top-bar [section]="section()" [userName]="jobs.user.name" (help)="help.open()" />
    <main #main id="pw-main" tabindex="-1" class="flex-1 px-4 py-6 outline-none min-[900px]:p-10">
      <router-outlet (activate)="activated()" />
      <p class="mt-10 mb-0 text-pw-label font-medium text-pw-muted">
        Preview with sample data. Nothing is really read or sent.
      </p>
    </main>
    <pw-help-dialog #help [admin]="jobs.user.admin" />
  `,
})
export class PathwayShell {
  protected readonly jobs = inject(PathwayJobs);
  private readonly router = inject(Router);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  protected readonly section = signal<PwSection>('home');
  private hydrated = false;

  constructor() {
    this.section.set(this.sectionFor(this.router.url));
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.section.set(this.sectionFor(e.urlAfterRedirects)));
    afterNextRender(() => (this.hydrated = true));
  }

  protected activated() {
    // Move focus to the new page so keyboard and screen reader users start at the top.
    if (this.hydrated) this.main().nativeElement.focus({ preventScroll: true });
  }

  private sectionFor(url: string): PwSection {
    return url.startsWith('/pathway/jobs') ? 'jobs' : 'home';
  }
}
