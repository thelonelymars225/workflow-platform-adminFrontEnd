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
import { PathwayJobs } from '../../data/pathway-jobs';
import { PwHelpDialog } from '../../shared/pw-help-dialog/pw-help-dialog';
import { PwSection, PwTopBar } from '../../shared/pw-top-bar/pw-top-bar';

/** Layout for every signed-in Pathway screen: top bar, page, help dialog. */
@Component({
  selector: 'pw-shell',
  imports: [RouterOutlet, PwTopBar, PwHelpDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex min-h-dvh flex-col bg-pw-bg font-pathway text-pw-ink' },
  templateUrl: './pathway-shell.html',
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
